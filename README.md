# COOK — Club Event Ops

Event operations for college club officers: plan an event, run it, and close it out. Manual CRUD works on its own; three skills (Ops Assist, Outreach Assist, and **AFTERS**) suggest work that an officer confirms before anything is saved or sent.

**Not** a social campus app. **Not** five chatbots. One app spine + skill contracts.

Recording a demo? `docs/DEMO.md` is the click-through script. Presenting Cursor itself on stage? `docs/DEMO-IDEA-REPO-RESCUE-LIVE.md` is the live audience-bug-raid format.

## Quick start

```bash
npm install
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Sample data

`npm run db:seed` creates **Hack Club** with a **Build Night: Repo Rescue** event (tasks, run-of-show, drafts, metrics).

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | SQLite path for local dev (`file:./dev.db`) |
| `COOK_AUTH_BYPASS` | No | Set `true` to use dev auth stub (default) |
| `COOK_WORKSPACE_ID` | No | Pin active workspace when multiple exist |

Future (not needed — skills run deterministically without them):

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase Auth
- `COOK_AI_PROVIDER=openai` + `OPENAI_API_KEY` — take the LLM branch in `src/lib/ai/provider.ts`

Copy `.env.example` to `.env`. **Never commit secrets.**

## Architecture

### App spine (`src/`)

| Area | Path | Purpose |
|------|------|---------|
| Home cockpit | `src/app/page.tsx` | Skills strip, counters, events in the next 14 days |
| Event detail | `src/app/events/[id]/page.tsx` | Brief, tasks, run-of-show, Ops/Outreach/AFTERS panels |
| Approvals | `src/app/approvals/page.tsx` | Draft queue (approve-before-send) |
| CRUD actions | `src/lib/actions/crud.ts` | Server actions for all manual ops |
| Auth stub | `src/lib/auth.ts` | Dev bypass; NextAuth/Supabase-ready |
| Workspace scope | `src/lib/workspace.ts` | Multi-tenant context |
| AI router | `src/app/api/ai/route.ts` | Single entrypoint (validation) |
| Skill dispatch | `src/lib/ai/router.ts` | Loads event context, routes to handlers |
| Skill handlers | `src/lib/ai/{ops,outreach,metrics}/` | Deterministic v1 — no API key |
| Apply actions | `src/lib/actions/assist.ts` | Persist only what an officer ticked |

### Data model (`prisma/schema.prisma`)

Prisma + SQLite for local development. Entities:

- **Workspace** + **WorkspaceMember** (roles: OWNER, OFFICER, MEMBER)
- **Partner** + **Contact**
- **Event** (brief, schedule, status)
- **Task**, **RunOfShowItem**
- **Draft** (channel: EMAIL/SLACK; status: draft → awaiting_approval → sent/rejected)
- **Metric**, **FollowUp**

Production Postgres/Supabase migration notes: `docs/supabase-rls-stubs.sql`.

### Skills (`skills/`)

Teammates own skill folders. The app calls one endpoint:

```bash
curl -X POST http://localhost:3000/api/ai \
  -H 'Content-Type: application/json' \
  -d '{"role":"metrics","eventId":"<id>","input":"debrief"}'
```

| Role (API) | UI name | Status |
|------------|---------|--------|
| `ops` | Ops Assist | Live — readiness gaps, tasks, run of show |
| `outreach` | Outreach Assist | Live — drafts that stop at Approvals |
| `metrics` | **AFTERS** | Live — metrics, follow-ups, debrief, thank-you draft |
| `manager` | Manager | Live — keyword router to the right skill |

`metrics` is branded **AFTERS** in the UI; the API role name never changes.
All handlers are deterministic (templates filled from Prisma data), so the app
works offline with no API key. See `skills/README.md` for contracts, the skill
author quickstart, and parallel-work rules.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:push` | Apply Prisma schema to SQLite |
| `npm run db:seed` | Load sample workspace + event |
| `npm run db:reset` | Reset DB and re-seed |

## Auth & multi-tenancy (M1 stubs)

- `COOK_AUTH_BYPASS=true` returns a fixed dev officer session.
- All queries should filter by `workspaceId` (see `requireActiveWorkspaceId()`).
- **TODO:** Wire NextAuth or Supabase Auth; replace bypass.
- **TODO(RLS):** Enable Supabase RLS policies (stubs in `docs/supabase-rls-stubs.sql`).

## What's stubbed

- `/api/ai` — real deterministic handlers for `ops`, `outreach`, `metrics`, and
  `manager` (`stub: false`); no LLM provider wired
- Auth — dev bypass only
- Draft "Approve" — marks `SENT` in DB; no Gmail/Slack integration
- Supabase/Postgres — schema documented, not wired

## Contributing skills (parallel work)

### Ops skill authors

1. Read `skills/ops/SKILL.md`
2. Add prompts/tools under `skills/ops/`
3. Extend `/api/ai` to handle `role: "ops"`
4. Return task/run-of-show suggestions; officers apply via UI

### Outreach skill authors

1. Read `skills/outreach/SKILL.md`
2. Drafts must flow through **Approvals** — never auto-send
3. Use `createDraft` server action to persist suggestions

### AFTERS / metrics skill authors

1. Read `skills/metrics/SKILL.md` — it is the reference pack (contract, prompts, sample output)
2. Suggest metrics/follow-ups; officers confirm before save
3. Keep the API role `metrics`; "AFTERS" is UI branding only

### App spine changes

- Schema: edit `prisma/schema.prisma`, run `npm run db:push`
- Shared AI types: `src/lib/ai/types.ts`
- Coordinate via PRs to `main`

## License

See [LICENSE](LICENSE).
