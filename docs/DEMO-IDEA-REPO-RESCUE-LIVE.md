# Demo idea: Repo Rescue — Live

**One-liner:** the audience files real bugs against this repo from their phones, a
fleet of parallel Cursor cloud agents races to fix them, Bugbot reviews the PRs in
~90 seconds, and the top-voted fix is merged and running on screen before the talk
ends. Their bug. Fixed. Merged. In one demo slot.

This is a companion to `docs/DEMO.md` (the 2-minute COOK product recording). That
script shows the *app*. This demo shows *Cursor* — using this repo as the arena.
The seed event is already called **Build Night: Repo Rescue**, so the demo and the
sample data tell the same story.

---

## Why this stands out (the research)

**What everyone else's Cursor demo looks like.** Campus workshops and meetups
overwhelmingly run one of two formats: a feature tour (Tab → Cmd+K → Chat → Agent)
or "build an app from scratch in an afternoon" — see e.g. the
[UTAMU workshop](https://luma.com/9hxm540g),
[Cursor @ UCLA: Intro to Cursor + MCP](https://luma.com/i1f9wf41), and the
[Maven Cursor workshop](https://maven.com/p/ba1dc6/cursor-workshop-builds-apps-and-ai-agents).
The audience watches someone else's greenfield project appear. It's impressive
once, and it's what every AI-editor demo (Copilot, Windsurf, etc.) also does.
Nobody in the room owns any part of the outcome.

**What makes live demos memorable.** The formats people actually talk about
afterwards share two mechanics:

1. **A phone-in-hand participation loop.** QR code on screen → audience acts →
   their action visibly lands in the demo. The
   [Wheel of Names live-hack](https://github.com/ma3u/wheel/blob/main/LIVEHACK.md)
   format (scan, type your name, watch it hit the wheel, someone wins) and
   [MLH's API-demo guidance](https://news.mlh.io/best-practices-for-giving-an-api-demo-at-a-hackathon-01-23-2023)
   both land on the same point: interactivity turns a sponsor talk into a
   touchpoint people remember. 2026 demo-craft writeups
   ([live-coding best practices](https://dasroot.net/posts/2026/04/live-coding-presentations-best-practices/))
   say the same: polls, live input, one impactful interaction — not a feature list.
2. **One narrative payoff, bulletproofed.** Under ~5 minutes of "live risk,"
   pre-staged inputs, and a rehearsed fallback for every failure mode.

**What Cursor can do in 2026 that campus demos aren't showing.** From the
[changelog](https://cursor.com/changelog) and
[cloud agent docs](https://cursor.com/docs/cloud-agent):

- **`/in-cloud` parallel subagents** — each task gets its own VM and branch;
  several agents work simultaneously while the local session stays free.
- **Cloud agents control a computer** — they run the app, click through it in a
  browser, and attach **screenshots/video artifacts** proving the fix works
  ([blog](https://cursor.com/blog/agent-computer-use)).
- **`/babysit`** — a cloud agent iterates a PR to merge-ready on its own.
- **Bugbot at ~90 seconds per review**, runnable pre-push with `/review`.
- **Design Mode** — click, draw, or *speak* UI changes in the Cursor browser.

None of these appear in the standard campus format. All of them are *visual* —
which is exactly what a stage demo needs.

**The gap this demo fills:** audience-owned backlog + visibly parallel agents +
a merged-to-main payoff. It demonstrates the thing that actually differentiates
Cursor in 2026 — *delegation and verification*, not autocomplete — in a format no
other editor demo on the circuit is running.

---

## The format

**Runtime:** 12 minutes on stage (agents work during minutes 3–9; you're never
waiting in silence). Works as a meetup centerpiece or a hackathon opening keynote.

**Cast:** you, your laptop, one big screen, and everyone's phones.

**Arena:** this repo, with 4–6 small bugs planted on a `demo/repo-rescue` branch
(see "Planting the bugs" below). Real code, real PRs, real merges — nothing faked.

### Beat by beat

| # | Beat | What's on screen | ~Time |
|---|------|------------------|-------|
| 1 | Cold open | COOK running with visible bugs. "This is our club's event-ops app. Tonight *you* are the QA team." QR code up. | 1:00 |
| 2 | The raid | Audience files bugs + upvotes from phones; reports stream onto a leaderboard on the big screen. | 2:00 |
| 3 | The dispatch | Take the top 3. In Cursor: `/in-cloud` → one prompt per bug. Show the Agents window: three VMs, three branches, working in parallel. | 1:30 |
| 4 | Design Mode interlude | While agents run: open the Cursor browser on COOK, click the header, and *say out loud* "make this match our club colors and tighten the spacing." Audience watches voice become a diff. | 2:00 |
| 5 | The receipts | First cloud agent finishes. Open its PR **artifacts**: the agent's own screenshots/video of it clicking through the fixed page. "It didn't just edit code — it ran the app and checked." | 1:30 |
| 6 | The review | `/review` → Bugbot reads the diff in ~90 seconds, live. If it flags something, even better — fix it on stage or let the agent take the feedback. | 2:00 |
| 7 | The merge | `/babysit` the winning PR (or merge directly if green). Pull, restart dev server, refresh. The bug the audience voted #1 is gone. Point at the person who filed it. | 1:30 |
| 8 | The meta close | Open COOK's own **AFTERS** panel and log tonight's demo as an event: attendance, "bugs filed" as a metric, follow-ups for the workshop next week. The app closes out its own launch. QR to cursor.com/students. | 0:30 |

**The line that lands:** *"Every other demo shows you an AI writing code. This one
showed you three coworkers you can hire for free — and one of them just shipped
your bug fix to main while I was talking."*

---

## The intake mechanic (pick one)

**Option A — `/raid` page in COOK (recommended, most on-brand).** A small addition
to the app: a mobile page with two fields (what's broken / where) writing to a
`RaidReport` table, plus a big-screen leaderboard at `/raid/board` with one-tap
upvotes and a QR code. Fits the repo's "the app is the product" thesis, works on
venue Wi-Fi with zero third-party services, and — the kicker — **you build the
`/raid` page itself with a Cursor agent the day before and show that PR as your
warm-up slide.** The demo has a prequel.

**Option B — GitHub issues.** QR straight to the repo's issue form with a
`bug-raid` template; upvotes are 👍 reactions. Zero build cost, and cloud agents
can be dispatched directly from the issue. Weaker big-screen moment (GitHub's UI
isn't a leaderboard) but the most "real workflow" version.

**Option C — Slido/poll fallback.** Pre-write the 6 planted bugs as poll options;
audience only votes on priority. Use this when venue Wi-Fi can't be trusted for
user-generated input.

## Planting the bugs

The audience finds bugs faster when bugs exist. Seed the `demo/repo-rescue` branch
with small, *visible*, well-scoped defects an agent can fix in minutes — each one
touching a different area so the parallel branches never collide:

| Planted bug | Where | Why it works on stage |
|-------------|-------|----------------------|
| Event date renders off-by-one (UTC/local mixup) | `src/app/events/[id]/page.tsx` | Everyone spots a wrong date instantly |
| Home counter counts rejected drafts as "awaiting action" | `src/app/page.tsx` | Number on screen is visibly wrong |
| Approvals queue sorted oldest-first with newest buried | `src/app/approvals/page.tsx` | Presenter can't find the new draft — felt pain |
| "Apply selected (0)" button enabled, throws on click | assist panels | A click that errors is a gift to the audience |
| Broken empty state — raw `undefined` in the tasks list | event page | Screenshots itself |
| Header contrast/spacing regression | layout | This one is *for Design Mode*, not the agents |

Audience-discovered bugs beyond the planted ones are bonus content: file them live,
dispatch a fourth agent, let it run past the end of the talk, and post the merged
PR in the club Slack that night. The demo outlives the room.

## Prep checklist (before the event)

- [ ] Commit `.cursor/environment.json` and warm the cloud-agent snapshot so VMs
      boot fast and can run `npm run dev` + the seed (`npm run db:reset`).
- [ ] Plant bugs on `demo/repo-rescue`; verify each is fixable by an agent in
      under ~6 minutes (rehearse the actual prompts, keep them in a crib sheet).
- [ ] Build the `/raid` page (Option A) via a Cursor agent; save that PR link.
- [ ] Full dress rehearsal on venue-like Wi-Fi; keep the rehearsal PRs **open** —
      they are your fallback (see below).
- [ ] Big screen at ~1440px, one window, zoom 125%, notifications off.
- [ ] `npm run db:reset` immediately before going live.

## Failure modes and fallbacks

| Risk | Fallback |
|------|----------|
| Venue Wi-Fi dies | Switch to Option C poll on your hotspot; run the three agents *locally* in parallel worktrees instead of `/in-cloud` — the parallel story survives offline |
| Cloud agents slower than expected | Beats 4–6 are designed as cover; if still not done, open the **rehearsal PR** for the same bug: "here's the exact run from last night, receipts included" and walk its artifacts |
| Bugbot finds a real problem in the fix | That's not a failure — that's the best possible 60 seconds of the demo. Let the agent address it |
| Audience files something huge ("add dark mode") | "Filed — that's next week's workshop." Convert it into the AFTERS follow-up in the closing beat |
| Merge conflicts between agent branches | Prevented by design: planted bugs touch disjoint files |

## Variants

- **5-minute lightning version:** pre-file the bugs yourself, audience only votes
  (Option C), dispatch 2 agents, cut Design Mode, keep the merge payoff.
- **Hackathon-opener version:** run the raid at kickoff, leave agents `/babysit`-ing
  through the weekend, and open the closing ceremony with the merged-PR scoreboard.
- **Workshop version:** after the stage demo, attendees clone the repo, get free
  Pro via [cursor.com/students](https://cursor.com/students), and each `/in-cloud`
  their own bug from the leaderboard backlog.

## Why this repo specifically

COOK already has everything the arena needs: seeded realistic data
(`npm run db:reset`), a UI with counters and queues where bugs are *visible*, an
approvals gate that mirrors the demo's own human-in-the-loop message, and AFTERS —
which makes the closing beat write itself. The demo's thesis and the app's thesis
are the same sentence: **agents propose, humans approve, receipts or it didn't
happen.**
