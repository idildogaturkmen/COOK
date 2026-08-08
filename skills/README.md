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
                  src/lib/ai/router.ts
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   skills/ops/      skills/outreach/   skills/metrics/
   Ops Assist        Outreach Assist    AFTERS
```

- **App team** owns routing, auth, database, UI, and the `/api/ai` router.
- **Skill authors** own prompt templates, tool definitions, and response shaping inside their `skills/<name>/` folder.
- There is **one AI entrypoint** — not five separate chatbots in the UI.

## Roles

| Role (API) | UI name | Folder | Responsibility | Status |
|------------|---------|--------|----------------|--------|
| `ops` | Ops Assist | `skills/ops/` | Tasks, run-of-show, readiness gaps | Live (deterministic) |
| `outreach` | Outreach Assist | `skills/outreach/` | Email/Slack drafts → Approvals | Live (deterministic) |
| `metrics` | **AFTERS** | `skills/metrics/` | After-event metrics, follow-ups, debrief | Live (deterministic) |
| `manager` | Manager | (router only) | Intent routing to the right skill | Live (keyword router) |

**AFTERS is the product name for the `metrics` role.** Officers see "AFTERS" in
the app; the API role stays `metrics` so integrations and the database do not
churn. Do not rename the role.

Every live handler returns `stub: false` and needs **no API key** — v1 handlers
fill templates from Prisma data, so demos and offline development work.

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

## Getting started for skill authors

For the `/api/ai` roles at the top of this file. The standalone Grok Bot skills
above are installed per bot instead — see `skills/outreach/HOW-SKILLS-WORK.md`.

1. **Clone and run the app.**

   ```bash
   npm install
   cp .env.example .env
   npm run db:push && npm run db:seed
   npm run dev
   ```

2. **Read your contract:** `skills/<role>/SKILL.md`. `skills/metrics/` is the
   reference pack — copy its shape (`SKILL.md`, `prompts/`, `examples/`).

3. **Add your types** to `src/lib/ai/types.ts` (e.g. `MetricsData`, `OpsData`).
   `AiResponse<TData>` is generic; `stub` is a boolean, so set `stub: false` when
   your handler runs for real.

4. **Implement the handler** in `src/lib/ai/<role>/handler.ts`. Take
   `(request, event)` where `event` comes from `loadEventContext()` in
   `src/lib/ai/context.ts`, and return your typed response. Keep it deterministic
   first — an LLM is a later branch behind `isLlmEnabled()` in
   `src/lib/ai/provider.ts`.

5. **Register it** in `src/lib/ai/router.ts`. Request validation stays in
   `src/app/api/ai/route.ts`.

6. **Add the button.** Assist panels live in `src/components/assist/`. Reuse
   `useAssist(role, eventId)` plus the shared preview primitives in
   `ui.tsx`, then render your panel from `src/app/events/[id]/page.tsx`.

7. **Write the apply action** in `src/lib/actions/assist.ts`: take the officer's
   selection, write rows, `revalidatePath`. Never write rows from the handler.

8. **Test it** end to end:

   ```bash
   curl -X POST http://localhost:3000/api/ai \
     -H 'Content-Type: application/json' \
     -d '{"role":"metrics","eventId":"<id>","input":"debrief"}'
   ```

### PR checklist

- [ ] `SKILL.md` updated: purpose, when to run, inputs/outputs, example JSON
- [ ] Types added to `src/lib/ai/types.ts` (no `any`, no per-skill response envelope)
- [ ] Handler returns `stub: false`; stub path still works for unimplemented roles
- [ ] Confirm-before-persist: preview → Apply → rows written by a server action
- [ ] **No auto-send.** Outbound copy becomes a `Draft` for `/approvals`
- [ ] No PII in inputs, prompts, or generated copy
- [ ] Manual CRUD still works with the skill unused
- [ ] `npm run build` passes
- [ ] Sample output committed under `skills/<role>/examples/`

## Integration for Grok Bot and other external agents

- **`skills/<role>/SKILL.md` is the shared contract** — the same document the app
  and any external agent build against.
- The app only ever calls `POST /api/ai` with `{ role, eventId?, input }`.
  An external agent should produce the **same JSON `data` shape** for its role;
  then it can be swapped in behind the route with no UI changes.
- Officers **always confirm before persist or send.** An agent may propose
  metrics, follow-ups, tasks, or message copy. It may not write rows, and it may
  not send anything: drafts stop at `AWAITING_APPROVAL` in Approvals.
- Errors are conventional: `400` for invalid role/input, `404` for an unknown
  `eventId`, `500` if a handler throws.

## Parallel work guidelines

- Do not edit other skill folders without coordination.
- Shared types live in `src/lib/ai/types.ts` — propose changes via PR.
- Database schema changes go through `prisma/schema.prisma` + team review.
- Test with AI off: all CRUD must work without calling `/api/ai`.

## Demo

- `docs/DEMO.md` — click-through recording script: Home → Ops → Outreach → Approvals → AFTERS.
- `docs/cook-demo.pptx` — the pitch deck (rebuild it with `docs/make_demo_deck.py`).
