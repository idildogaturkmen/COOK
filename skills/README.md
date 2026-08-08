# COOK Skills

Club Event Ops (COOK) separates the **app spine** from **AI skills** so teammates can work in parallel.

## Club event skills (RSVP)

Reusable Cursor / Grok Bot skills for college club event planning:

1. Plan the event (concept, budget, run-of-show)
2. Create the Luma event invite via the `Luma event invite` skill (draft in browser; no publish without yes)
3. Source cafe/party supplies on Amazon with quality + delivery bars
4. Run a separate In-N-Out (or similar) food order plan — never mixed into the Amazon cart

| Skill folder | Use when |
|--------------|----------|
| `skills/plan-club-event/` | Concept, invite copy draft, budget, run-of-show, lock gate |
| `skills/luma-event-invite/` | Draft Luma event in browser; never publish without explicit yes |
| `skills/amazon-event-supplies/` | Amazon cart with review/rating/delivery filters |
| `skills/innout-event-order/` | Separate pickup-food order plan |
| `skills/rsvp-club-loop/` | Full workflow orchestrator (run in order) |

### Install on another account

Copy the club-event folders under `skills/` into that agent's workflows / skills directory, or add this repo as the shared skills source your team uses. Each `SKILL.md` is self-contained.

### Demo defaults (Cursor Build Night)

- Fun "matcha cafe" station the organizer runs themselves
- In-N-Out as a mid-event food run
- Dry-run safe: never publish invites or checkout without explicit approval

## App skills (M1)

### Architecture

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

### Roles

| Role | Folder | Responsibility |
|------|--------|----------------|
| `ops` | `skills/ops/` | Tasks, run-of-show, logistics |
| `outreach` | `skills/outreach/` | Email/Slack drafts → Approvals |
| `metrics` | `skills/metrics/` | Attendance, follow-ups, insights |
| `manager` | (router only) | Intent routing to the right skill |

### How to add your skill

1. Read your `skills/<role>/SKILL.md` contract.
2. Add prompt files, tools, or helpers under your folder (e.g. `skills/ops/prompts/`).
3. Extend `src/app/api/ai/route.ts` to dispatch `role` → your handler.
4. Return typed JSON matching the contract; set `stub: false` when live.
5. **Never** bypass Approvals for outbound messages.

### Parallel work guidelines

- Do not edit other skill folders without coordination.
- Shared types live in `src/lib/ai/types.ts` — propose changes via PR.
- Database schema changes go through `prisma/schema.prisma` + team review.
- Test with AI off: all CRUD must work without calling `/api/ai`.

### M1

All app skills return placeholders. Manual CRUD and the Approvals workflow are fully functional.
