/**
 * AFTERS — the after-event experience for COOK.
 *
 * API role stays `"metrics"` (teammates and external agents integrate against
 * that name); "AFTERS" is the product/UI branding. Contract and prompt
 * templates live in `skills/metrics/`.
 *
 * v1 is deterministic: it fills templates from event title, brief goals, task
 * completion, and existing Metric/FollowUp rows. No LLM key required. See
 * `src/lib/ai/provider.ts` for the seam where a provider plugs in.
 */
import {
  addDays,
  briefHeadline,
  extractGoals,
  formatShortDate,
  type EventContext,
} from "@/lib/ai/context";
import type {
  AiRequest,
  DebriefSuggestion,
  DraftPreview,
  FollowUpSuggestion,
  MetricSuggestion,
  MetricsResponse,
} from "@/lib/ai/types";

type Sections = {
  metrics: boolean;
  followUps: boolean;
  debrief: boolean;
  survey: boolean;
  draft: boolean;
};

/** Light keyword parse; anything unrecognized asks for the full AFTERS package. */
export function parseSections(input: string): Sections {
  const text = input.toLowerCase();
  const asked = {
    metrics: /\bmetric|attendance|headcount|number|signup/.test(text),
    followUps: /\bfollow[-\s]?up|next step|todo/.test(text),
    debrief: /\bdebrief|retro|recap|what went|review/.test(text),
    survey: /\bsurvey|poll|pulse|feedback form|question/.test(text),
    draft: /\bthank|draft|message|slack|email|note/.test(text),
  };

  const anyAsked = Object.values(asked).some(Boolean);
  if (!anyAsked) {
    return { metrics: true, followUps: true, debrief: true, survey: true, draft: true };
  }
  return asked;
}

const BASELINE_METRICS: MetricSuggestion[] = [
  { name: "attendance", unit: "people", notes: "Headcount from the sign-in sheet" },
  { name: "new signups", unit: "people", notes: "First-timers who joined the mailing list" },
  { name: "volunteer hours", unit: "hours", notes: "Officer + mentor hours, setup through cleanup" },
  { name: "would recommend", unit: "/5", notes: "Average of the post-event pulse question" },
];

function suggestMetrics(event: EventContext): MetricSuggestion[] {
  if (!event) return BASELINE_METRICS;

  const logged = new Set(event.metrics.map((m) => m.name.trim().toLowerCase()));
  const priorAttendance = event.metrics.find(
    (m) => m.name.trim().toLowerCase() === "attendance" && typeof m.value === "number",
  );

  const suggestions = BASELINE_METRICS.filter((m) => !logged.has(m.name.toLowerCase())).map(
    (m) => ({ ...m }),
  );

  if (priorAttendance?.value != null) {
    suggestions.unshift({
      name: "attendance vs. last time",
      unit: "people",
      notes: `Previously logged ${priorAttendance.value} — record the delta so trends stay readable.`,
    });
  }

  const demoCount = event.runOfShow.filter((item) => /demo|showcase|present/i.test(item.title)).length;
  if (demoCount > 0 && !logged.has("demos shown")) {
    suggestions.push({
      name: "demos shown",
      unit: "demos",
      notes: "Count lightning demos — a good proxy for how far projects got.",
    });
  }

  return suggestions.slice(0, 5);
}

function suggestFollowUps(event: EventContext): FollowUpSuggestion[] {
  const anchor = event?.endsAt ?? event?.startsAt ?? new Date();
  const title = event?.title ?? "the event";
  const openTasks = event?.tasks.filter((t) => t.status !== "DONE") ?? [];

  const followUps: FollowUpSuggestion[] = [
    {
      title: "Send thank-you note to attendees and mentors",
      dueAt: addDays(anchor, 2).toISOString(),
      notes: "Within 48 hours, while the event is still fresh. Goes through Approvals.",
    },
    {
      title: "Share pulse survey results with officers",
      dueAt: addDays(anchor, 7).toISOString(),
      notes: `+1 week: summarize what to keep and change for the next ${title}.`,
    },
    {
      title: "Re-invite first-timers to the next event",
      dueAt: addDays(anchor, 30).toISOString(),
      notes: "+1 month: a personal nudge converts one-time attendees into regulars.",
    },
  ];

  if (openTasks.length > 0) {
    followUps.splice(1, 0, {
      title: `Close out ${openTasks.length} open task${openTasks.length === 1 ? "" : "s"} from run-up`,
      dueAt: addDays(anchor, 3).toISOString(),
      notes: openTasks
        .slice(0, 3)
        .map((t) => t.title)
        .join(" · "),
    });
  }

  const existing = new Set(
    (event?.followUps ?? []).map((f) => f.title.trim().toLowerCase()),
  );
  return followUps.filter((f) => !existing.has(f.title.trim().toLowerCase()));
}

function suggestDebrief(event: EventContext): DebriefSuggestion {
  const title = event?.title ?? "the event";
  const goals = extractGoals(event?.brief);
  const doneTasks = event?.tasks.filter((t) => t.status === "DONE") ?? [];
  const openTasks = event?.tasks.filter((t) => t.status !== "DONE") ?? [];
  const rosCount = event?.runOfShow.length ?? 0;

  const wentWell: string[] = [];
  if (doneTasks.length > 0) {
    wentWell.push(
      `Prep held up: ${doneTasks.length} of ${event?.tasks.length ?? doneTasks.length} run-up tasks were done before doors opened (e.g. ${doneTasks[0].title.toLowerCase()}).`,
    );
  }
  if (rosCount > 0) {
    wentWell.push(
      `The ${rosCount}-block run of show kept the room moving — no dead air between segments.`,
    );
  }
  wentWell.push(
    goals.length > 0
      ? `Progress on the stated goal: ${goals[0].toLowerCase()}.`
      : `${title} drew a mix of returning members and first-timers.`,
  );

  const improve: string[] = [];
  if (openTasks.length > 0) {
    improve.push(
      `${openTasks.length} task${openTasks.length === 1 ? "" : "s"} slipped past the event (${openTasks[0].title.toLowerCase()}) — pull the deadline a week earlier next time.`,
    );
  }
  improve.push("Sign-in was the bottleneck at the door; pre-print name tags for anyone who RSVP'd.");
  improve.push(
    goals.length > 1
      ? `Under-served goal: ${goals[1].toLowerCase()} — assign one officer to own it explicitly.`
      : "Assign an officer to own feedback collection so the pulse survey does not get skipped.",
  );

  const quotes = [
    `"I finally got my dev environment running — I'd been stuck for weeks." — attendee, ${title}`,
    '"Having someone sit with me for ten minutes beat an hour of docs." — first-time attendee',
    '"Tell me when the next one is; I want to bring a friend." — returning member',
  ];

  const nextEventIdeas = [
    `${title}: part two, same format, with a dedicated newcomer table`,
    "Officer-led mini workshop on the single question that came up most tonight",
    "Partner co-host session to bring in a new audience",
  ];

  return { wentWell, improve, quotes, nextEventIdeas };
}

function suggestSurvey(event: EventContext): string[] {
  const title = event?.title ?? "this event";
  return [
    `How likely are you to recommend ${title} to a friend? (1–5)`,
    "What is one thing you got done or learned tonight?",
    "What slowed you down or felt confusing?",
    "What should we run next month?",
    "Would you like to help mentor at a future event? (yes / maybe / no)",
  ];
}

function buildInsights(event: EventContext): string[] {
  const insights: string[] = [];
  const logged = event?.metrics ?? [];
  const openFollowUps = (event?.followUps ?? []).filter((f) => !f.completed);

  if (logged.length === 0) {
    insights.push("No metrics logged yet — attendance is the one number worth capturing tonight.");
  } else {
    const named = logged
      .slice(0, 3)
      .map((m) => `${m.name}${m.value != null ? ` ${m.value}${m.unit ? ` ${m.unit}` : ""}` : ""}`)
      .join(", ");
    insights.push(`Already logged: ${named}.`);
  }

  if (openFollowUps.length > 0) {
    insights.push(
      `${openFollowUps.length} follow-up${openFollowUps.length === 1 ? "" : "s"} still open — oldest is "${openFollowUps[0].title}".`,
    );
  }

  if (event?.status !== "COMPLETED") {
    insights.push(
      `Event status is ${String(event?.status ?? "PLANNING").toLowerCase()}; mark it completed once AFTERS is filled in so it stops showing as upcoming work.`,
    );
  }

  insights.push("Thank-you notes sent within 48 hours are the cheapest retention lever a club has.");
  return insights;
}

function buildDraftPreview(event: EventContext): DraftPreview {
  const title = event?.title ?? "our event";
  const when = event?.startsAt ? formatShortDate(event.startsAt) : "this week";
  const goals = extractGoals(event?.brief);
  const nudge = goals.length > 0 ? `We set out to ${goals[0].toLowerCase()} — you made that happen.` : "";

  const body = [
    `Thanks for coming to ${title} on ${when}! 🙌`,
    "",
    `The room was full of people helping each other out, and it showed. ${nudge}`.trim(),
    "",
    "Two quick things:",
    "1. Tell us how it went — the 4-question pulse survey takes under a minute.",
    "2. Save the date for the next one; bring the project you did not get to tonight.",
    "",
    "If you want to help mentor next time, reply here and we will add you to the list.",
    "",
    "— The officer team",
  ]
    .filter((line, index, all) => !(line === "" && all[index - 1] === ""))
    .join("\n");

  return {
    channel: "SLACK",
    subject: `Thank you — ${title}`,
    body,
  };
}

/**
 * Run AFTERS for a request. `event` is null when no eventId was supplied, in
 * which case a generic template is returned so the UI still has something useful.
 */
export function runAftersSkill(request: AiRequest, event: EventContext): MetricsResponse {
  const sections = parseSections(request.input);
  const debrief = suggestDebrief(event);

  const summaryParts: string[] = [];
  if (event) {
    const headline = briefHeadline(event.brief);
    summaryParts.push(
      `AFTERS package for ${event.title} (${String(event.status).toLowerCase()}).`,
    );
    if (headline) summaryParts.push(headline);
  } else {
    summaryParts.push("AFTERS package using the generic club template (no event linked).");
  }
  summaryParts.push("Nothing is saved until you apply it.");

  return {
    role: "metrics",
    eventId: request.eventId,
    summary: summaryParts.join(" "),
    suggestions: [
      "Log attendance first — every other number reads against it.",
      "Apply the +1 week and +1 month follow-ups so momentum does not decay.",
      "The thank-you note lands in Approvals as a draft; an officer still sends it.",
    ],
    data: {
      metrics: sections.metrics ? suggestMetrics(event) : [],
      followUps: sections.followUps ? suggestFollowUps(event) : [],
      debrief: sections.debrief
        ? debrief
        : { wentWell: [], improve: [], quotes: [], nextEventIdeas: [] },
      surveyQuestions: sections.survey ? suggestSurvey(event) : [],
      insights: buildInsights(event),
      draftPreview: sections.draft ? buildDraftPreview(event) : undefined,
    },
    stub: false,
  };
}
