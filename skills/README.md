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
