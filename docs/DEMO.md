# COOK demo script

A 2-minute screen recording of Club Event Ops: one app spine, four skills, and an
approval gate. Everything below runs offline — no API keys.

## Setup (once, before recording)

```bash
npm install
cp .env.example .env
npm run db:reset   # push schema + seed Hack Club and "Build Night: Repo Rescue"
npm run dev        # http://localhost:3000
```

Reset between takes with `npm run db:reset` so the Approvals queue and AFTERS
panel start clean.

## Recording script

**1. Home — the cockpit (15s)**
Open `http://localhost:3000`. Read the header: *Hack Club — one app spine plus
four skills, not five separate chatbots.* Point at the **Skills** strip:
`ops` → Ops Assist, `outreach` → Outreach Assist, `metrics` → **AFTERS**,
`manager` → the router. Note the stat cards: events this week, drafts awaiting
action, open AFTERS follow-ups.

> Say: every skill is one call to `POST /api/ai` with a role. The app is the
> product; the skills plug into it.

**2. Into the event (10s)**
Click **AFTERS** in the skills strip (or *Open event*). The event page is the
stage: brief, tasks, run of show, then the three assist panels. Use the jump
chips at the top to show the sections.

**3. Ops Assist (20s)**
Press **Check event readiness**. The preview shows risks (open tasks, unassigned
work) and suggested tasks with a run-of-show timeline. Tick two suggestions →
**Apply selected**. Scroll up: the new rows are in the Tasks list.

> Say: the skill suggests, the officer confirms. Nothing writes to the database
> until Apply.

**4. Outreach Assist (25s)**
Choose a preset chip — **Announce the event** — and press **Draft message**. Two
drafts appear (Slack announcement + 24h reminder) with full body text. Tick one
→ **Save 1 draft to Approvals**. The green banner links straight to Approvals.

> Say: outreach never auto-sends. It can only produce a draft.

**5. Approvals (15s)**
Follow the link. The new draft sits at the top as **awaiting approval**, with the
event linked. Show **Approve (stub send)** and **Reject**. Approve it and watch
the counters change.

**6. AFTERS — the after-event experience (35s)**
Back to the event, jump to **AFTERS**. Existing metrics (attendance 24, new
signups 7) and follow-ups are already there — log one by hand to show CRUD works
with AI off (`attendance` / `31` / `people` → **Log metric**).

Then press **✨ Generate with AFTERS**. Walk the preview:
- *Read on the event* — what is already logged, what is still open
- *Metrics to log* — tick `would recommend`, type `4.6`
- *Follow-ups* — +48 hours, +1 week, +1 month
- *Debrief* — went well / improve / quotes / next event ideas
- *Pulse survey* — 5 short questions
- *Thank-you note* — a Slack draft, unchecked or checked

Press **Apply selected (N)**. Metrics and follow-ups appear in the panel; the
thank-you note is queued in Approvals.

**7. Close (10s)**
Return to Approvals to show the thank-you note awaiting approval, then Home to
show the follow-up counter moved.

> Say: AFTERS turns "that went well I think" into logged numbers, dated
> follow-ups, and a debrief the next officer can read — with a human in the loop
> for anything that leaves the club.

## Optional: show the contract

```bash
curl -s -X POST http://localhost:3000/api/ai \
  -H 'Content-Type: application/json' \
  -d '{"role":"metrics","eventId":"<event id>","input":"debrief"}' | jq '.stub, .data | keys'
```

`stub: false` for `ops`, `outreach`, and `metrics` — deterministic handlers, no
API key. The contract is in `skills/metrics/SKILL.md`; a full sample response is
in `skills/metrics/examples/repo-rescue-debrief.json`.

Copy the event id from the seed output, or from the URL of the event page.

## If something looks off on camera

| Symptom | Fix |
|---------|-----|
| Home shows no events this week | The seed places the event on the next Wednesday; the Skills strip still points at the closest event. Re-run `npm run db:reset`. |
| Approvals queue is cluttered | `npm run db:reset` |
| Preview says it cannot reach `/api/ai` | The dev server restarted — reload the page |
