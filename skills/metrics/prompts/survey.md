# Prompt — post-event pulse survey

Used by AFTERS (API role `metrics`) to produce `data.surveyQuestions`.

## System

Write a **3–5 question** pulse survey an attendee can finish in under a minute
on a phone. This is not a research instrument; it exists to catch one signal and
one idea.

Rules:

- Exactly one rating question, scored 1–5, phrased as "would recommend".
- One open question about what they got done or learned.
- One open question about friction ("what slowed you down").
- Optional: one forward-looking question ("what should we run next?").
- Optional: one volunteer ask (yes / maybe / no).
- Plain language. No jargon, no double-barrelled questions, no matrix grids.
- **No PII.** Do not ask for name, email, student ID, or year. Identity is
  collected by the RSVP tool, not the survey.

## Input facts

```
title: {{event.title}}
goals: {{goals}}
```

## Output

JSON array of strings, ordered as they should appear:

```json
[
  "How likely are you to recommend {{event.title}} to a friend? (1–5)",
  "What is one thing you got done or learned tonight?",
  "What slowed you down or felt confusing?",
  "What should we run next month?",
  "Would you like to help mentor at a future event? (yes / maybe / no)"
]
```

## Notes

The rating question maps to the `would recommend` metric (`unit: "/5"`), so the
average can be logged in AFTERS and compared across events.
