/**
 * Ops Assist — deterministic v1.
 *
 * Compares the event's existing tasks and run of show against a standard club
 * event checklist and returns the gaps. Officers confirm before anything is
 * written. Contract lives in `skills/ops/SKILL.md`.
 */
import { addDays, extractGoals, type EventContext } from "@/lib/ai/context";
import type { AiRequest, OpsResponse, RunOfShowSuggestion, TaskSuggestion } from "@/lib/ai/types";

type Playbook = {
  match: RegExp;
  tasks: TaskSuggestion[];
  runOfShow: RunOfShowSuggestion[];
};

const CHECKLIST: TaskSuggestion[] = [
  { title: "Confirm room booking and access", notes: "Lock the room a week out; ask who unlocks the door." },
  { title: "Post reminder in club Slack 24h before", notes: "Include time, room, and what to bring." },
  { title: "Print sign-in sheet and name tags", notes: "Pre-print for anyone who RSVP'd to cut the door queue." },
  { title: "Assign a greeter for the first 30 minutes", notes: "First-timers leave if nobody talks to them." },
  { title: "Buy snacks and drinks", notes: "Budget roughly one snack per expected attendee, plus 20%." },
  { title: "Charge or test AV (projector, adapters, mic)", notes: "Bring a backup HDMI adapter." },
  { title: "Prep feedback capture (survey link or sticky notes)", notes: "Decide now who collects it, or it will not happen." },
  { title: "Plan cleanup crew and trash run", notes: "Two people, 15 minutes, before everyone drifts off." },
];

const PLAYBOOKS: Playbook[] = [
  {
    match: /build|hack|repo|code|workshop/i,
    tasks: [
      { title: "Recruit 2 mentors for pairing", notes: "One mentor per 5 attendees keeps queues short." },
      { title: "Post the setup prerequisites (repo link, install steps)", notes: "Cuts 20 minutes of dev-env debugging." },
    ],
    runOfShow: [
      { time: "6:00 PM", title: "Doors open, sign-in", durationMin: 10 },
      { time: "6:10 PM", title: "Kickoff: format + how to get help", durationMin: 10 },
      { time: "6:20 PM", title: "Pairing and build time", durationMin: 100 },
      { time: "8:00 PM", title: "Lightning demos", durationMin: 20, notes: "2 minutes per team, optional." },
      { time: "8:30 PM", title: "Feedback + cleanup", durationMin: 20 },
    ],
  },
  {
    match: /panel|talk|speaker|info ?session/i,
    tasks: [
      { title: "Confirm speaker travel and intro bio", notes: "Ask for a 2-sentence intro you can read aloud." },
      { title: "Prepare 5 backup audience questions", notes: "Silence after a talk is the awkward part." },
    ],
    runOfShow: [
      { time: "6:00 PM", title: "Doors open, seating", durationMin: 15 },
      { time: "6:15 PM", title: "Welcome + speaker intro", durationMin: 5 },
      { time: "6:20 PM", title: "Talk", durationMin: 40 },
      { time: "7:00 PM", title: "Moderated Q&A", durationMin: 20 },
      { time: "7:20 PM", title: "Mingle + photo", durationMin: 20 },
    ],
  },
];

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
}

function overlaps(candidate: string, existing: string[]): boolean {
  const words = new Set(normalize(candidate).split(/\s+/).filter((w) => w.length > 3));
  return existing.some((item) => {
    const itemWords = normalize(item).split(/\s+/).filter((w) => w.length > 3);
    const shared = itemWords.filter((w) => words.has(w)).length;
    return shared >= 2 || normalize(item) === normalize(candidate);
  });
}

export function runOpsSkill(request: AiRequest, event: EventContext): OpsResponse {
  const existingTaskTitles = event?.tasks.map((t) => t.title) ?? [];
  const playbook = PLAYBOOKS.find((p) => p.match.test(`${event?.title ?? ""} ${event?.brief ?? ""}`));

  const wanted = [...(playbook?.tasks ?? []), ...CHECKLIST];
  const anchor = event?.startsAt ?? new Date();

  const tasks: TaskSuggestion[] = wanted
    .filter((task) => !overlaps(task.title, existingTaskTitles))
    .slice(0, 6)
    .map((task, index) => ({
      ...task,
      dueAt: addDays(anchor, -(index < 3 ? 5 : 2)).toISOString(),
    }));

  const runOfShow: RunOfShowSuggestion[] =
    (event?.runOfShow.length ?? 0) > 0 ? [] : (playbook?.runOfShow ?? PLAYBOOKS[0].runOfShow);

  const risks: string[] = [];
  const openTasks = event?.tasks.filter((t) => t.status !== "DONE") ?? [];
  if (openTasks.length > 0) {
    risks.push(
      `${openTasks.length} open task${openTasks.length === 1 ? "" : "s"} — unowned work tends to land on whoever shows up first.`,
    );
  }
  const unassigned = openTasks.filter((t) => !t.assignee);
  if (unassigned.length > 0) {
    risks.push(`${unassigned.length} task${unassigned.length === 1 ? " has" : "s have"} no assignee.`);
  }
  if ((event?.runOfShow.length ?? 0) === 0) {
    risks.push("No run of show yet — without a timed spine the room drifts after the first 20 minutes.");
  }
  if (!event?.location) {
    risks.push("No location set on the event.");
  }
  const goals = extractGoals(event?.brief);
  if (goals.length === 0) {
    risks.push("The brief has no explicit goals, so AFTERS will have nothing to measure against.");
  }

  const summary = event
    ? `Ops Assist checked ${event.title}: ${existingTaskTitles.length} task${existingTaskTitles.length === 1 ? "" : "s"} and ${event.runOfShow.length} run-of-show block${event.runOfShow.length === 1 ? "" : "s"} on file. ${tasks.length} gap${tasks.length === 1 ? "" : "s"} found. Nothing is saved until you apply it.`
    : "Ops Assist returned the standard club event checklist (no event linked).";

  return {
    role: "ops",
    eventId: request.eventId,
    summary,
    suggestions: [
      tasks.length > 0
        ? `Top gap: ${tasks[0].title.toLowerCase()}.`
        : "Task list looks complete against the standard checklist.",
      runOfShow.length > 0
        ? "No run of show on file — apply the suggested timeline as a starting point."
        : "Run of show exists; tighten the transitions rather than adding blocks.",
      "Assign an owner to every task before the event, not during it.",
    ],
    data: { tasks, runOfShow, risks },
    stub: false,
  };
}
