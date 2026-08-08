import Link from "next/link";
import { Card } from "@/components/card";
import { Chip } from "@/components/chip";
import { PageHeader } from "@/components/page-header";
import { createEvent, createWorkspace } from "@/lib/actions/crud";
import { db } from "@/lib/db";
import { getActiveWorkspaceId } from "@/lib/workspace";

/** How far ahead the digest looks. A Monday-to-Sunday cut hides events 4 days out. */
const HORIZON_DAYS = 14;

function formatEventDate(date: Date): string {
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** The four AI roles, branded as officers see them. `metrics` is AFTERS in the UI. */
const skills = [
  {
    role: "ops",
    name: "Ops Assist",
    tagline: "Spots missing prep tasks and run-of-show gaps",
    anchor: "#ops-assist",
    accent: "text-blue-700 dark:text-blue-300",
    bar: "bg-blue-500",
    border: "hover:border-blue-300 dark:hover:border-blue-800",
  },
  {
    role: "outreach",
    name: "Outreach Assist",
    tagline: "Drafts the Slack post or partner email → Approvals",
    anchor: "#outreach-assist",
    accent: "text-violet-700 dark:text-violet-300",
    bar: "bg-violet-500",
    border: "hover:border-violet-300 dark:hover:border-violet-800",
  },
  {
    role: "metrics",
    name: "AFTERS",
    tagline: "Metrics, follow-ups, and the post-event debrief",
    anchor: "#afters",
    accent: "text-amber-700 dark:text-amber-300",
    bar: "bg-amber-500",
    border: "hover:border-amber-300 dark:hover:border-amber-800",
  },
  {
    role: "manager",
    name: "Manager",
    tagline: "Routes one request to the right skill",
    anchor: "",
    accent: "text-zinc-800 dark:text-zinc-200",
    bar: "bg-zinc-400",
    border: "hover:border-zinc-300 dark:hover:border-zinc-600",
  },
] as const;

export default async function HomePage() {
  const workspaceId = await getActiveWorkspaceId();
  const workspace = workspaceId
    ? await db.workspace.findUnique({ where: { id: workspaceId } })
    : null;

  const now = new Date();
  const windowStart = new Date(now.getTime() - 12 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + HORIZON_DAYS * 24 * 60 * 60 * 1000);

  const events = workspaceId
    ? await db.event.findMany({
        where: {
          workspaceId,
          startsAt: { gte: windowStart, lt: windowEnd },
        },
        orderBy: { startsAt: "asc" },
        include: {
          tasks: { where: { status: { not: "DONE" } } },
          _count: { select: { drafts: true, metrics: true } },
        },
      })
    : [];

  /** Event the skills strip points at: the next one up, else the most recent. */
  const focusEvent =
    events[0] ??
    (workspaceId
      ? ((await db.event.findFirst({
          where: { workspaceId, startsAt: { gte: now } },
          orderBy: { startsAt: "asc" },
        })) ??
        (await db.event.findFirst({
          where: { workspaceId },
          orderBy: { startsAt: "desc" },
        })))
      : null);

  const pendingDrafts = workspaceId
    ? await db.draft.count({
        where: {
          workspaceId,
          status: { in: ["DRAFT", "AWAITING_APPROVAL"] },
        },
      })
    : 0;

  const openFollowUps = workspaceId
    ? await db.followUp.count({
        where: { completed: false, event: { workspaceId } },
      })
    : 0;

  return (
    <>
      <PageHeader
        title="Club Event Ops"
        description={
          workspace
            ? `${workspace.name} — one app spine plus four skills, not five separate chatbots.`
            : "Create a workspace to get started"
        }
      >
        {focusEvent ? (
          <Link
            href={`/events/${focusEvent.id}`}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Open event →
          </Link>
        ) : null}
      </PageHeader>

      {!workspace ? (
        <Card title="Create workspace">
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            COOK is scoped to a club workspace. Create one to manage events, tasks, and
            approval drafts.
          </p>
          <form action={createWorkspace} className="flex flex-col gap-3 sm:flex-row">
            <input
              name="name"
              placeholder="e.g. CS Club"
              aria-label="Workspace name"
              required
              className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
            >
              Create workspace
            </button>
          </form>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Skills</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                One call to{" "}
                <code className="rounded bg-zinc-100 px-1 font-mono dark:bg-zinc-800">
                  POST /api/ai
                </code>{" "}
                per role · officer confirms before anything saves
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {skills.map((skill) => {
                const href = focusEvent
                  ? `/events/${focusEvent.id}${skill.anchor}`
                  : "/approvals";
                return (
                  <Link
                    key={skill.role}
                    href={href}
                    className={`group relative flex h-full flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white p-4 pl-4 transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 ${skill.border}`}
                  >
                    <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${skill.bar}`} />
                    <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      role: {skill.role}
                    </span>
                    <span className={`mt-1.5 text-base font-semibold ${skill.accent}`}>
                      {skill.name}
                    </span>
                    <span className="mt-1.5 flex-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {skill.tagline}
                    </span>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-zinc-400 transition group-hover:text-zinc-700 dark:group-hover:text-zinc-200">
                      Open
                      <span aria-hidden className="transition group-hover:translate-x-0.5">
                        →
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <p className="text-3xl font-semibold tabular-nums">{events.length}</p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Events in the next {HORIZON_DAYS} days
              </p>
            </Card>
            <Link
              href="/approvals"
              className="group rounded-lg border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
            >
              <p className="text-3xl font-semibold tabular-nums">{pendingDrafts}</p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Drafts awaiting action{" "}
                <span
                  aria-hidden
                  className="inline-block transition group-hover:translate-x-0.5"
                >
                  →
                </span>
              </p>
            </Link>
            {focusEvent ? (
              <Link
                href={`/events/${focusEvent.id}#afters`}
                className="group rounded-lg border border-zinc-200 bg-white p-4 transition hover:border-amber-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-amber-900/60"
              >
                <p className="text-3xl font-semibold tabular-nums">{openFollowUps}</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Open AFTERS follow-ups{" "}
                  <span
                    aria-hidden
                    className="inline-block transition group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </p>
              </Link>
            ) : (
              <Card>
                <p className="text-3xl font-semibold tabular-nums">{openFollowUps}</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Open AFTERS follow-ups
                </p>
              </Card>
            )}
          </div>

          <Card title="Coming up">
            {events.length > 0 ? (
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {events.map((event) => (
                  <li
                    key={event.id}
                    className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/events/${event.id}`}
                        className="font-medium hover:underline"
                      >
                        {event.title}
                      </Link>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {formatEventDate(event.startsAt)}
                        {event.location ? ` · ${event.location}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Chip tone={event.tasks.length > 0 ? "amber" : "green"}>
                        {event.tasks.length} open tasks
                      </Chip>
                      <Chip>{event._count.metrics} metrics</Chip>
                      <Link
                        href={`/events/${event.id}#afters`}
                        className="rounded-full border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-amber-800 dark:hover:bg-amber-950/40 dark:hover:text-amber-200"
                      >
                        AFTERS →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                <p>
                  Nothing scheduled in the next {HORIZON_DAYS} days. Create an event below, or run{" "}
                  <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">npm run db:seed</code>{" "}
                  for sample data.
                </p>
                {focusEvent ? (
                  <p className="mt-2">
                    Closest event:{" "}
                    <Link href={`/events/${focusEvent.id}`} className="underline">
                      {focusEvent.title}
                    </Link>{" "}
                    · {formatEventDate(focusEvent.startsAt)}
                  </p>
                ) : null}
              </div>
            )}
          </Card>

          <Card title="New event">
            <form action={createEvent} className="grid gap-3 sm:grid-cols-2">
              <input
                name="title"
                placeholder="Event title"
                aria-label="Event title"
                required
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 sm:col-span-2"
              />
              <input
                name="startsAt"
                type="datetime-local"
                aria-label="Starts at"
                required
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
              <input
                name="location"
                placeholder="Location"
                aria-label="Location"
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
              <textarea
                name="brief"
                placeholder="Brief (goals, audience, notes)"
                aria-label="Brief"
                rows={2}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 sm:col-span-2"
              />
              <button
                type="submit"
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 sm:col-span-2 sm:w-fit"
              >
                Create event
              </button>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
