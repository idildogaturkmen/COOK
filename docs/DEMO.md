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

Run `npm run db:reset` between takes so the Approvals queue and the AFTERS panel
start clean. Browser at ~1440px wide, one tab, zoom 100%.

## Shot order

| # | Shot | Screen | ~Time |
|---|------|--------|-------|
| 1 | Cockpit | `/` — header, Skills strip, counters | 15s |
| 2 | Event stage | `/events/[id]` — chips bar, jump links | 10s |
| 3 | Ops Assist | Suggest tasks → preview → Apply | 20s |
| 4 | Outreach Assist | Draft outreach → preview → Apply | 25s |
| 5 | Approvals | Queue, approve the draft | 15s |
| 6 | AFTERS | Log a metric, generate, Apply | 35s |
| 7 | Close | Approvals + Home counters moved | 10s |

## The script

**1. Home — the cockpit**
Open `http://localhost:3000`. Read the header: *Hack Club — one app spine plus
four skills, not five separate chatbots.* Point at the **Skills** card: four
colour-coded roles — `ops` → Ops Assist, `outreach` → Outreach Assist,
`metrics` → **AFTERS**, `manager` → the router. Below it, three counters: events
coming up, drafts awaiting action, open AFTERS follow-ups.

> Say: every skill is one call to `POST /api/ai` with a role. The app is the
> product; the skills plug into it.

**2. Into the event**
Click the **AFTERS** card (it deep-links to the panel) or **Open event →**. Show
the chips bar under the title — status, open tasks, metrics, open follow-ups —
and the jump links. Scroll past Brief / Tasks / Run of show to the **Skills**
divider: three panels, same shape every time.

**3. Ops Assist**
Press **🔎 Suggest tasks**. The preview opens with *Risks spotted* (open tasks,
unassigned work) and a checklist of suggested tasks. Tick two, press
**Apply selected (2)**. Scroll up: the rows are in Tasks.

> Say: the skill suggests, the officer confirms. Nothing writes until Apply.

**4. Outreach Assist**
Pick an angle — **Announce the event** — then press **✉️ Draft outreach**. Two
full drafts appear (Slack announcement and 24h reminder). Tick one, press
**Save 1 draft to Approvals**. A green banner links straight to Approvals.

> Say: outreach never auto-sends. It can only produce a draft.

**5. Approvals**
Follow the link. The new draft sits at the top, highlighted amber and chipped
**awaiting approval**, with the event linked. Show **Approve & mark sent** and
**Reject**, approve it, and watch the counters change.

**6. AFTERS — the after-event experience**
Back to the event, jump to **AFTERS**. Attendance 24 and new signups 7 are
already logged, and one follow-up is open. Log one by hand to prove CRUD works
with AI off: `attendance` / `31` / `people` → **Log metric**.

Then press **✨ Generate with AFTERS** and walk the preview:

- *Read on the event* — what is logged, what is still open
- *Metrics to log* — tick `would recommend`, type `4.6`
- *Follow-ups* — +2 days, +1 week, +1 month, each dated
- *Debrief* — went well / improve / quotes / next event ideas
- *Pulse survey* — five short questions
- *Thank-you note* — a Slack draft, checked by default

The Apply bar stays pinned while you scroll. Press **Apply selected (N)**.
Metrics and follow-ups appear above; the thank-you note is queued in Approvals.

**7. Close**
Return to Approvals to show the thank-you note awaiting approval, then Home to
show the follow-up counter moved.

> Say: AFTERS turns "that went well I think" into logged numbers, dated
> follow-ups, and a debrief the next officer can read — with a human in the loop
> for anything that leaves the club.

## Optional: show the contract

```bash
curl -s -X POST http://localhost:3000/api/ai \
  -H 'Content-Type: application/json' \
  -d '{"role":"metrics","eventId":"<event id>","input":"debrief"}' | jq '.stub, (.data | keys)'
```

`stub: false` for `ops`, `outreach`, and `metrics` — deterministic handlers, no
API key. The contract is `skills/metrics/SKILL.md`; a full sample response is
`skills/metrics/examples/repo-rescue-debrief.json`. Copy the event id from the
seed output or the event URL.

## If something looks off on camera

| Symptom | Fix |
|---------|-----|
| Approvals queue is cluttered from an earlier take | `npm run db:reset` |
| Home shows nothing coming up | The seed places the event on the next Wednesday, inside the 14-day window; re-run `npm run db:reset` |
| Preview says it cannot reach `/api/ai` | The dev server restarted — reload the page |
| Apply button is disabled | Nothing is ticked; use **Select all** |
