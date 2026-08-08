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
| Plan club event | `skills/plan-club-event/` | Intake (ZIP + Luma creative inputs), concept, budget, run-of-show, Amazon-vs-local note, lock gates |
| Luma event invite | `skills/luma-event-invite/` | Collect vibes, brand assets, and language **before** opening Luma; one browser pass; screenshot; stop before Publish |
| Amazon event supplies | `skills/amazon-event-supplies/` | Headcount + ZIP quantity math (1.3–1.5× buffer); tiered ratings; ASIN shortlist; Amazon vs local split; dry-run safe |
| Event food order | `skills/event-food-order/` | Any vendor; headcount + ~10% buffer; dietary split; cost estimate before pay — separate from Amazon cart |
| In-N-Out event order | `skills/innout-event-order/` | **Deprecated alias** → use Event food order |
| RSVP club loop | `skills/rsvp-club-loop/` | End-to-end orchestration: plan → Luma → lock (incl. ZIP) → Amazon → food → day-of |

Typical flow:

1. **Plan** the event (concept, budget, run-of-show, ZIP, vibes/brand/language intake)
2. **Luma invite** via `luma-event-invite` — creative inputs first, one browser pass, screenshot, no publish without yes
3. **Lock** final date, headcount, budget, and ZIP
4. **Amazon supplies** — quantity math, tiered ratings (>500 reviews, ≥4.6/4.5/4.4), delivery ≥2 days to ZIP; durables on Amazon, milk/ice local
5. **Food order** — user picks vendor; ~10% buffer, dietary split, cost estimate before pay — never mixed into the Amazon cart
6. **Day-of** checklist from the plan skill

### Install on another account

Copy the skill folders under `skills/` into that agent's workflows / skills directory, or add this repo as the shared skills source your team uses. Each `SKILL.md` is self-contained.

### Demo defaults (Cursor Build Night)

- Fun "matcha cafe" station the organizer runs themselves
- User-chosen food vendor via Event food order (no default restaurant)
- **DEMO / dry-run safe:** never publish invites or checkout without explicit approval

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
