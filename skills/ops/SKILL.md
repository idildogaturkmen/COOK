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

### Expected response shape (when implemented)

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

## Implementation notes

1. Read event context from Prisma (`Event`, `Task`, `RunOfShowItem`) scoped by workspace.
2. Never auto-create drafts or send messages — return structured suggestions for officer review.
3. Register your prompt/tools in the skill folder; wire into `/api/ai` when ready.
4. See `skills/README.md` for parallel development guidelines.

## M1 status

**Stub only.** `/api/ai` returns placeholder JSON. Implement this skill by extending the route handler to load `skills/ops/` prompts and call your LLM provider.
