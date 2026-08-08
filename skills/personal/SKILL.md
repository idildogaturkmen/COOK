---
name: Personal daily brief
description: Use when the user asks what they have going on or wants a plan for their day/week — reads Notion, calendar, and email via connected tools, surfaces conflicts and items awaiting reply, and proposes a time-blocked plan. Read-only; every write needs explicit approval.
---

# Personal daily brief

## When to use
The user asks things like "what's on today?", "plan my week", "what am I blocked on?", "anything waiting on a reply?", or "catch me up". This is personal productivity, not club event ops — for events, hand off to the ops/outreach/metrics skills.

## Modes
Pick from the phrasing; confirm only if genuinely ambiguous.
- **Daily brief** ("what's on today?") — today only, ≤10-second read.
- **Weekly plan** ("plan my week") — Mon–Sun view, deadlines pulled forward, plan per day.
- **Needs-action sweep** ("what's waiting on me?") — skip the schedule; only unanswered threads, stale tasks, and blocked people.

## Sources
Check what's connected **before** gathering; never assume.
1. **Notion** (Notion MCP) — open tasks, due dates, databases, pages edited in the last 7 days. If it needs auth, run `mcp_auth` once, then continue — never retry auth in a loop.
2. **Calendar** — capable MCP server if connected, else the signed-in browser. If Google Workspace blocks OAuth connectors, go straight to the browser.
3. **Email** — same access path as calendar. Pull thread subjects, senders, and timestamps — not bodies.
4. **iMessage** — macOS only. On Windows, mark unavailable and move on. Never block the brief on a missing source.

## Loop
1. **Intake** — mode, date range, and any focus the user named ("just school stuff", "ignore recruiting").
2. **Gather** — calendar blocks for the range, Notion tasks with due dates in range (plus overdue), unanswered inbound threads, recently edited pages as a signal of active work.
3. **Triage** with the hard rules below.
4. **Brief** — lead with the one thing that changes the user's day (a conflict, a deadline today, a person blocked on them). Then the schedule, then needs-action.
5. **Propose plan** — time blocks with a one-line reason each. Show the plan; **never write it anywhere** without explicit approval.

## Hard triage rules (all enforced)
- **Conflict:** two calendar blocks overlap by any amount → flag both, suggest which to move based on attendee count (fewer people = easier to move). Never pick silently.
- **Waiting on you:** last message in a thread is inbound and older than **24h** → needs-action, with sender and age ("Sarah, 3 days").
- **You're blocking someone:** a task assigned to the user that another person's task or thread depends on → top of needs-action, above the user's own deadlines.
- **Overdue:** past-due Notion task → carries into every brief until done or explicitly dropped by the user. Don't quietly forget it.
- **Stale:** task untouched for **14+ days** with no due date → list under "stale, confirm or drop", max 3 per brief.

## Planning rules
- Fixed commitments (classes, meetings with others) are immovable — plan around them, never propose moving them.
- Leave **15-minute buffers** between back-to-back blocks; no zero-gap schedules.
- Deep-work tasks get blocks of **≥60 minutes**; batch shallow items (replies, quick tasks) into one block, don't sprinkle them.
- Schedule the scariest deadline earliest in the day, not last.
- Cap the plan at what fits — if there's more work than hours, say what doesn't fit instead of compressing everything.

## Guardrails
- **Read-only by default.** Never create events, send messages, or edit Notion without explicit approval **per action** — approve-before-send, same convention as the Approvals queue.
- Tag every claim with its source (`calendar` / `notion` / `email`) so the user can verify it in two clicks.
- Report each source's status (read / unavailable / needs-auth) in one line — never silently skip one.
- Titles, senders, and timestamps only — no message bodies or attachment contents in context.
- If a source times out or looks half-loaded, say so and brief from what you have; a partial brief beats a stalled one.

## Report format
```
TL;DR: <the one thing that matters most today>

Today                          (source)
  9:00–9:50   CS 188 lecture   calendar
  12:00–1:00  ⚠ overlaps: club sync / office hours   calendar

Needs action
  1. Reply to Sarah re: venue — waiting 3 days, she's blocked   email
  2. Overdue: submit reimbursement form (due Tue)               notion

Proposed plan (not saved — say the word)
  10:00–11:30  Problem set 4 — due tomorrow, hardest thing first
  1:15–1:45    Replies batch: Sarah, treasurer thread

Sources: notion ✓  calendar ✓  email ✓  imessage unavailable (Windows)
```

## Handoffs
- Club event planning → skill `Plan club event`
- Event supplies or food runs → skills `Amazon event supplies` / `In-N-Out event order`
- Anything requiring a send or a write → the Approvals queue, never direct.
