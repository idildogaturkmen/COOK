# Demo idea: LIVE IN PROD

**One-liner:** the audience walks into an event whose entire software stack —
RSVP page, check-in QR, live schedule, pizza poll, badge wall on the projector —
was secretly built by Cursor cloud agents. Mid-talk, you reveal it, then let the
room request changes to the event *they are currently standing inside*. Agents
patch it live, Bugbot guards the deploy, and when the merge lands, **every phone
in the room updates at once.**

Not tied to COOK or any existing repo. The demo ships with its own tiny
agent-built event stack (see "The build" below).

**The thesis, said out loud on stage:**

> "Every coding demo you've ever seen deploys to localhost. Tonight we deploy to
> the room. The app on your phone right now is production, you are the users,
> and if the agent gets it wrong, two hundred phones break in front of me. Let's
> find out."

---

## Why this is actually new (the novelty map)

Researched the current demo circuit specifically to find claimed territory.
Everything obvious is taken:

| Format | Already done by |
|---|---|
| Feature tour / build-an-app-from-scratch | Every campus workshop ([UTAMU](https://luma.com/9hxm540g), [UCLA](https://luma.com/i1f9wf41), [Maven](https://maven.com/p/ba1dc6/cursor-workshop-builds-apps-and-ai-agents)) |
| Audience files issues → agent → live PR | Microsoft **Build 2026** stage talk ([build-2026-cli-live](https://github.com/EvanBoyle/build-2026-cli-live)) |
| Audience prompts a game that hot-reloads while people play | **Maker Faire 2026** ([makerfaire2026](https://github.com/benstein/makerfaire2026)), [Jam](https://github.com/henkaku-center/jam) live-music version in Tokyo |
| Agents racing / arenas / spectator voting | [Agent Arena](https://github.com/ArthurzKV/agent-arena), [AI Olympics](https://github.com/stefanogebara/ai-olympics), [Model Combat](https://github.com/Model-Combat/model-combat) |
| Ship-from-your-phone, no laptop | Riley Brown's viral couch demo, [Drape](https://dev.to/drape_dev/i-built-a-mobile-ide-with-ai-agents-heres-how-it-works-under-the-hood-36aj), iPhone-SSH rigs |
| Resurrect dead/abandoned repos | [Lazarus](https://github.com/DoctorDean/lazarus) (hackathon winner, July 2026), CodeCrypt, a whole "Resurrection"-themed hackathon |
| Agent PRs a stranger's real repo | [AgentGrid](https://github.com/ishanavasthi/agentgrid) |

**The structural gap:** in every one of those, the software being modified is a
prop — a throwaway repo, a toy game, someone else's project. The audience
watches; nothing they rely on is at stake. **No demo has ever live-patched
software the audience is actively depending on in that moment.** That's the
whole trick here: the event's own infrastructure is the demo substrate, so the
deploy has real stakes, and the payoff lands on every device in the room
simultaneously instead of on the presenter's screen.

It's also the only format on that list whose drama comes from Cursor's actual
2026 differentiators rather than raw codegen: agents that
[onboard themselves and verify with computer use + artifacts](https://cursor.com/blog/agent-computer-use),
parallel [`/in-cloud` subagents](https://cursor.com/changelog), Bugbot's
~90-second [`/review`](https://cursor.com/changelog) as the thing standing
between the diff and 200 phones, and Design Mode voice edits. Deploying to a
room *requires* the verification story. That's the point.

---

## The arc (three reveals, ~15 minutes)

### Act 0 — before the talk (invisible)

Attendees RSVP on the event site, check in with a QR at the door, watch the
live schedule, vote in the pizza poll. Their names pop onto the badge wall on
the projector. It reads as normal, slightly-nice event tooling. Nobody thinks
about it. **That's the setup: the demo is already running and they're in it.**

### Act 1 — Reveal #1: "nobody built this" (3 min)

Open not with slides but with `git log`. Every commit on the event stack is
authored by cloud agents. Show one agent's transcript and its **artifacts** —
the screen recording of the agent clicking through the RSVP flow it had just
built, checking its own work. Line: *"I didn't build tonight. I wrote one
paragraph last Tuesday. Agents built the rest and left me the receipts."*

### Act 2 — Reveal #2: "and it's still soft" (7 min)

The site's nav gains a new tab: **Change this event.** Two fields, one tap.
Requests stream onto the big screen with live upvotes ("schedule should show
time-until, not clock time", "badge wall needs dark mode", "add a song-request
queue for the afterparty").

Take the top two. Dispatch each with `/in-cloud` — two agents, two VMs, two
branches, visible side by side in the Agents window. While they work, do a
Design Mode interlude on the badge wall: click the header in the Cursor
browser and *say aloud* "make this glow when someone checks in" — voice
becomes a diff while the parallel agents grind.

First agent finishes. Walk its PR: the diff, then the artifact — video of the
agent using a staging copy of the site *on its own computer* to prove the
change works. Then the money moment: `/review`. Bugbot reads the diff live,
~90 seconds, and the room understands what it's for — *this review is the only
thing between that code and your phone.* If Bugbot flags something, that's the
best minute of the night; let the agent take the feedback.

### Act 3 — the merge that hits their hands (3 min)

Merge. Deploy. Say *"look at your phone."* The schedule flips to time-until on
two hundred screens at once. No demo where the audience watches a presenter's
monitor can compete with the moment the change arrives *in their hands*.

Optional chaos beat for brave rooms: take one deliberately risky request,
deploy it behind a canary flag to the big screen only, break it, and roll back
live — thirty seconds that teach checkpoints and rollbacks better than any
slide ever has.

### Close — the fork (1 min)

The site flips itself into afterparty mode (the song-request agent finished
during Act 3 — it was the third `/in-cloud` you quietly dispatched). Final QR:
fork the event-stack template + [cursor.com/students](https://cursor.com/students).
*"Your club's next meeting can run on this. One paragraph. Agents do the rest —
and now you know they leave receipts."* The follow-up email goes out that
night, agent-drafted, human-approved — the demo keeps its own promise about
the human in the loop.

---

## The build

A deliberately small stack, and **building it is part of the demo's content**
(Act 1 shows the agent transcripts that made it):

- **One Next.js app, one Postgres/SQLite DB, deployed anywhere with instant
  rollbacks.** Pages: `/` (schedule), `/checkin`, `/wall` (projector), `/poll`,
  `/change` (the request+upvote feed), all real-time via SSE or polling —
  venue Wi-Fi friendly, no third-party realtime service.
- **Written by cloud agents from one prompt document** (`BRIEF.md`, one
  paragraph per feature) in the week before the event. Keep every transcript
  and artifact; they are Act 1.
- **Staging + prod**, feature flags on anything risky, big-screen canary
  before room-wide, one-command rollback — rehearsed, because the rollback is
  a *feature* of the show, not an embarrassment.
- **Change-request scope fence:** the `/change` form nudges toward UI/copy/
  schedule-level asks; you pick what gets dispatched. Planted "ringer"
  requests in your pocket in case the room's asks are all too big for the
  time slot.

## Failure modes

| Risk | Plan |
|---|---|
| Venue Wi-Fi dies | The stack runs on a local box + travel router; phones join the demo SSID. Prod-in-the-room literally means in the room |
| Agent slower than the slot | Act 2's Design Mode interlude is elastic cover; worst case, walk the rehearsal PR for the same request — receipts included |
| Bugbot flags a real problem | Not a failure — the strongest 60 seconds of the format. Let the agent address it live |
| Merge actually breaks prod | Canary caught it on the big screen first; if not, the rehearsed 30-second rollback becomes the chaos beat you were hoping for |
| Room asks only for huge features | Ringer requests + "that one's a club workshop, filed" — convert to follow-ups in the close |

## Variants

- **5-minute lightning:** skip Act 0's slow burn; open on `git log`, one
  `/in-cloud` change, one merge, phones update, done.
- **Hackathon-opener:** the hackathon's own site (schedule, judging queue,
  help desk) is the stack; keep taking change requests all weekend and merge
  them between ceremonies.
- **Recurring club meeting:** the stack persists; every meeting starts with
  "what did agents change since last week," and members' merged requests
  accumulate — the club's infrastructure becomes its own ongoing demo.

## Why it stands out, in one paragraph

Every other format asks the audience to *imagine* the stakes. This one
manufactures real ones: real users (them), real production (the room), real
consequences (their phones), and a verification story (artifacts, Bugbot,
canary, rollback) that exists because the stakes demand it — which happens to
be exactly the story that differentiates Cursor in 2026. The audience doesn't
remember watching a demo. They remember being *inside* one when it updated
under their thumbs.
