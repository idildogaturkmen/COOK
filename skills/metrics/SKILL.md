# Metrics Skill

**Owner:** Metrics team (attendance, follow-ups, retros)

## Purpose

Track event outcomes, suggest follow-ups, and surface trends across club events.

## Contract

```
POST /api/ai
{
  "role": "metrics",
  "eventId": "<optional event id>",
  "input": "<natural language request>"
}
```

### Expected response shape (when implemented)

```json
{
  "role": "metrics",
  "eventId": "...",
  "summary": "Analysis summary",
  "suggestions": ["..."],
  "data": {
    "metrics": [{ "name": "...", "value": 0, "unit": "..." }],
    "followUps": [{ "title": "...", "dueAt": "...", "notes": "..." }],
    "insights": ["..."]
  },
  "stub": false
}
```

## Implementation notes

1. Read `Metric` and `FollowUp` records scoped to workspace/event.
2. Suggest follow-ups; officers confirm before persisting.
3. Keep metrics generic (attendance, signups, volunteer hours) — avoid PII in prompts.

## M1 status

**Stub only.** Implement in `skills/metrics/` and register with `/api/ai`.
