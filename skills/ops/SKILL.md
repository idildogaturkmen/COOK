# Ops Skill

**Owner:** Ops team (event logistics, tasks, run-of-show)

## Purpose

Help club officers plan and execute events: task breakdowns, run-of-show drafts, day-of checklists, and blocker detection.

## Contract

The app calls the single AI entrypoint:

```
POST /api/ai
{
  "role": "ops",
  "eventId": "<optional event id>",
  "input": "<natural language request>"
}
```

### Response shape

```json
{
  "role": "ops",
  "eventId": "...",
  "summary": "Human-readable summary",
  "suggestions": ["..."],
  "data": {
    "tasks": [{ "title": "...", "assignee": "...", "dueAt": "..." }],
    "runOfShow": [{ "time": "...", "title": "...", "notes": "..." }],
    "risks": ["..."]
  },
  "stub": false
}
```

Typed as `OpsData` in `src/lib/ai/types.ts`.

## Implementation notes

1. Read event context from Prisma (`Event`, `Task`, `RunOfShowItem`) scoped by workspace.
2. Never auto-create drafts or send messages — return structured suggestions for officer review.
3. Register your prompt/tools in the skill folder; the router lives in `src/lib/ai/router.ts`.
4. See `skills/README.md` for parallel development guidelines.

## Status: live (deterministic v1)

Handler: `src/lib/ai/ops/handler.ts` — no API key required.

**Ops Assist** (UI name) compares the event's tasks and run of show against a
standard club checklist plus a format playbook (build night, panel/talk) and
returns the gaps, along with `risks` such as unassigned work or a missing
timeline. It returns `stub: false`.

Officers see suggestions in the Ops Assist panel on `/events/[id]`, tick what
they want, and press Apply — which calls `applyOps()` in
`src/lib/actions/assist.ts` to create `Task` and `RunOfShowItem` rows. The
handler itself never writes to the database.

To add an LLM later, branch inside the handler at `isLlmEnabled()`
(`src/lib/ai/provider.ts`) and keep the same `OpsData` shape.
