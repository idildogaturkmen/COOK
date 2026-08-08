# AFTERS — after-event skill (API role: `metrics`)

**Owner:** Metrics team · **UI name:** AFTERS · **API role:** `metrics` (do not rename)

> AFTERS is what club officers see in the app. `metrics` is what the API, the
> database, and other agents integrate against. Same skill, two names on purpose:
> officers get a product, teammates get a stable contract.

## Purpose

The hour after an event is when clubs lose momentum. AFTERS turns "that went
well I think" into logged numbers, dated follow-ups, and a debrief the next
officer can read — plus a thank-you note that stops in Approvals.

## When to run it

| Moment | Input to send | What you get |
|--------|---------------|--------------|
| Right after the doors close | `"Generate full AFTERS debrief, follow-ups, and thank-you draft"` | Everything below |
| Logging numbers only | `"suggest metrics to log"` | `metrics[]` |
| Planning next steps | `"follow-ups for the next month"` | `followUps[]` |
| Writing the retro | `"debrief"` | `debrief` |
| Building a feedback form | `"survey questions"` | `surveyQuestions[]` |

Keyword parsing is intentionally loose (`skills/metrics/handler` → `parseSections`);
anything unrecognized returns the full package.

## Contract

```
POST /api/ai
{
  "role": "metrics",
  "eventId": "<optional event id>",
  "input": "<natural language request>"
}
```

Response (`AiResponse<MetricsData>` in `src/lib/ai/types.ts`):

```json
{
  "role": "metrics",
  "eventId": "clx…",
  "summary": "AFTERS package for Build Night: Repo Rescue (confirmed). …",
  "suggestions": ["Log attendance first — every other number reads against it."],
  "data": {
    "metrics": [{ "name": "attendance", "value": null, "unit": "people", "notes": "…" }],
    "followUps": [{ "title": "Send thank-you note…", "dueAt": "2026-08-12T02:00:00.000Z", "notes": "…" }],
    "debrief": {
      "wentWell": ["…"],
      "improve": ["…"],
      "quotes": ["…"],
      "nextEventIdeas": ["…"]
    },
    "surveyQuestions": ["How likely are you to recommend…"],
    "insights": ["Already logged: attendance 24 people."],
    "draftPreview": { "channel": "SLACK", "subject": "Thank you — …", "body": "…" }
  },
  "stub": false
}
```

Errors: `400` for a bad role/input, `404` when `eventId` does not exist.
A full worked example lives in `examples/repo-rescue-debrief.json`.

### Inputs the handler reads

Event title, brief (including `Goals:` bullets), status, start/end time, task
completion, existing run-of-show blocks, and existing `Metric` / `FollowUp` rows
for the event. Nothing else — see the PII rule below.

## Rules (non-negotiable)

1. **Confirm before persist.** The handler returns suggestions. Rows are only
   written when an officer ticks them and presses Apply
   (`applyAfters` in `src/lib/actions/assist.ts`).
2. **Never auto-send.** `draftPreview` becomes a `Draft` row with status
   `AWAITING_APPROVAL`. A human approves it on `/approvals`.
3. **No PII in prompts.** Metrics stay generic — attendance, signups, volunteer
   hours, would-recommend scores. No attendee names or emails go into inputs or
   generated copy. Quotes in the debrief are illustrative templates, not
   transcriptions.
4. **Works with AI off.** Officers can log metrics and follow-ups by hand from
   the AFTERS panel; the skill is additive.

## How the UI calls it

`src/components/assist/afters-assist.tsx` (client) → `POST /api/ai` →
preview → **Apply selected** → `applyAfters()` server action → `Metric`,
`FollowUp`, and `Draft` rows → `revalidatePath`.

## Implementation

| Piece | Path |
|-------|------|
| Handler (deterministic v1) | `src/lib/ai/metrics/handler.ts` |
| Shared event context loader | `src/lib/ai/context.ts` |
| Router / dispatch | `src/lib/ai/router.ts` |
| Types | `src/lib/ai/types.ts` |
| Prompt templates | `skills/metrics/prompts/*.md` |
| Sample output | `skills/metrics/examples/repo-rescue-debrief.json` |

v1 is deterministic: templates filled from Prisma data, no API key, works
offline. To add an LLM, keep the same types and branch inside the handler at the
seam in `src/lib/ai/provider.ts` (`isLlmEnabled()`), using
`prompts/debrief.md`, `prompts/survey.md`, and `prompts/followups.md` as the
system prompts. The UI does not change.

## For Grok Bot and other external agents

This file is the shared contract. An external agent should emit the exact same
`data` shape so it can be swapped in behind `/api/ai` without touching the UI.
Whatever produces the JSON, the officer still confirms before anything is
persisted or sent.
