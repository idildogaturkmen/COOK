# COOK — Club Event Ops

Event operations for college club officers. M1 delivers a working Next.js skeleton with manual CRUD, an approval queue for outreach drafts, and stub AI skills your teammates can plug in later.

**Not** a social campus app. **Not** five chatbots. One app spine + skill contracts.

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

Future (not needed for M1):

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase Auth
- `OPENAI_API_KEY` — real LLM for `/api/ai`

Copy `.env.example` to `.env`. **Never commit secrets.**

## Architecture

### App spine (`src/`)

| Area | Path | Purpose |
|------|------|---------|
| Home digest | `src/app/page.tsx` | This-week events, open tasks, draft count |
| Event detail | `src/app/events/[id]/page.tsx` | Brief, tasks, run-of-show |
| Approvals | `src/app/approvals/page.tsx` | Draft queue (approve-before-send) |
| CRUD actions | `src/lib/actions/crud.ts` | Server actions for all manual ops |
| Auth stub | `src/lib/auth.ts` | Dev bypass; NextAuth/Supabase-ready |
| Workspace scope | `src/lib/workspace.ts` | Multi-tenant context |
| AI router | `src/app/api/ai/route.ts` | Single entrypoint for skills |

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
  -d '{"role":"ops","input":"Suggest tasks for build night"}'
```

See `skills/README.md` for contracts and parallel-work rules.

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

## What's stubbed in M1

- `/api/ai` — typed JSON placeholder, no LLM
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

### Metrics skill authors

1. Read `skills/metrics/SKILL.md`
2. Suggest metrics/follow-ups; officers confirm before save

### App spine changes

- Schema: edit `prisma/schema.prisma`, run `npm run db:push`
- Shared AI types: `src/lib/ai/types.ts`
- Coordinate via PRs to `main`

## License

See [LICENSE](LICENSE).
