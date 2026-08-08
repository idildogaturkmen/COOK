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

### Expected response shape (when implemented)

```json
{
  "role": "outreach",
  "eventId": "...",
  "summary": "Draft ready for review",
  "suggestions": ["..."],
  "data": {
    "drafts": [
      {
        "channel": "EMAIL | SLACK",
        "subject": "...",
        "body": "...",
        "suggestedStatus": "DRAFT"
      }
    ]
  },
  "stub": false
}
```

## Implementation notes

1. Pull `Partner`, `Contact`, and `Event` context for personalization.
2. Create drafts via server actions (`createDraft`) — never call Gmail/Slack APIs directly from the skill.
3. Officers submit drafts for approval; only approved drafts may be marked `SENT` (M1 stubs send).
4. Do not build a separate chatbot UI — responses feed the Approvals screen.

## M1 status

**Stub only.** Wire LLM + prompt templates in `skills/outreach/` when ready.
