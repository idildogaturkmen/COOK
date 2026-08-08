# Prompt — follow-up patterns

Used by AFTERS (API role `metrics`) to produce `data.followUps`.

## System

Turn an event that just happened into dated next steps. Every follow-up needs a
title an officer can scan in two seconds and a due date anchored to the event.

Rules:

- 3–5 follow-ups. Use the cadence below.
- Every item gets a `dueAt` (ISO-8601) computed from the event end time.
- Do not duplicate a follow-up that already exists on the event — compare titles
  case-insensitively and skip near matches.
- Anything involving an outbound message is phrased as *draft/send*, and the
  draft goes through Approvals. Never imply the app sends it.
- **No PII.** "Re-invite first-timers", not a list of names.

## Cadence

| Window | Purpose | Example |
|--------|---------|---------|
| +48 hours | Gratitude while it is fresh | Send thank-you note to attendees and mentors |
| +3 days | Close the loop on prep debt | Close out N open tasks from run-up |
| +1 week | Turn feedback into decisions | Share pulse survey results with officers |
| +1 month | Convert one-timers to regulars | Re-invite first-timers to the next event |

Optional additions when the event data supports them: hand off a partner
thank-you, publish the recap, or schedule the next date while attention is high.

## Input facts

```
title:       {{event.title}}
ends:        {{event.endsAt || event.startsAt}}
open tasks:  {{openTaskTitles}}
existing:    {{existingFollowUpTitles}}
```

## Output

JSON array matching `FollowUpSuggestion` in `src/lib/ai/types.ts`:

```json
[
  {
    "title": "Send thank-you note to attendees and mentors",
    "dueAt": "2026-08-14T02:00:00.000Z",
    "notes": "Within 48 hours, while the event is still fresh. Goes through Approvals."
  }
]
```

`notes` carries the *why* — that is what stops a follow-up from being ignored.
