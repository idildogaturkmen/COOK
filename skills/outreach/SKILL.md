# Outreach Skill

**Owner:** Outreach team (partner comms, member announcements)

## Purpose

Draft email and Slack messages for club events and partner relationships. All output goes through the **Approvals** queue — approve-before-send is mandatory.

## Contract

```
POST /api/ai
{
  "role": "outreach",
  "eventId": "<optional event id>",
  "input": "<natural language request>"
}
```

### Response shape

```json
{
  "role": "outreach",
  "eventId": "...",
  "summary": "Draft ready for review",
  "suggestions": ["..."],
  "data": {
    "drafts": [
      {
        "label": "Slack announcement (#general)",
        "channel": "EMAIL | SLACK",
        "subject": "...",
        "body": "...",
        "suggestedStatus": "AWAITING_APPROVAL"
      }
    ],
    "notes": ["..."]
  },
  "stub": false
}
```

Typed as `OutreachData` in `src/lib/ai/types.ts`.

## Implementation notes

1. Pull `Partner`, `Contact`, and `Event` context for personalization.
2. Create drafts via server actions (`createDraft`) — never call Gmail/Slack APIs directly from the skill.
3. Officers submit drafts for approval; only approved drafts may be marked `SENT` (M1 stubs send).
4. Do not build a separate chatbot UI — responses feed the Approvals screen.

## Status: live (deterministic v1)

Handler: `src/lib/ai/outreach/handler.ts` — no API key required.

**Outreach Assist** (UI name) picks an intent from the input (announce, 24h
reminder, partner/venue, recruit mentors) and returns two ready-to-edit message
previews built from event facts. It returns `stub: false`.

Applying a preview calls `applyOutreachDrafts()` in
`src/lib/actions/assist.ts`, which creates `Draft` rows with status
`AWAITING_APPROVAL`. They appear on `/approvals`, where an officer approves or
rejects. **Nothing is sent from the skill or the panel** — there is no send path
in the codebase yet, and adding one must keep the approval gate.

Generated copy uses no attendee names or emails. To add an LLM later, branch at
`isLlmEnabled()` (`src/lib/ai/provider.ts`) and keep the same `OutreachData` shape.
