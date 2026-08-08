import Link from "next/link";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { createEvent, createWorkspace } from "@/lib/actions/crud";
import { db } from "@/lib/db";
import { getActiveWorkspaceId } from "@/lib/workspace";

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(date: Date): Date {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return end;
}

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
    tagline: "Missing prep tasks and run-of-show gaps",
    anchor: "#ops-assist",
    accent: "text-blue-700 dark:text-blue-300",
    ring: "hover:border-blue-300 dark:hover:border-blue-800",
  },
  {
    role: "outreach",
    name: "Outreach Assist",
    tagline: "Slack posts and partner emails → Approvals",
    anchor: "#outreach-assist",
    accent: "text-violet-700 dark:text-violet-300",
    ring: "hover:border-violet-300 dark:hover:border-violet-800",
  },
  {
    role: "metrics",
    name: "AFTERS",
    tagline: "Metrics, follow-ups, and the post-event debrief",
    anchor: "#afters",
    accent: "text-amber-700 dark:text-amber-300",
    ring: "hover:border-amber-300 dark:hover:border-amber-800",
  },
  {
    role: "manager",
    name: "Manager",
    tagline: "Routes one request to the right skill",
    anchor: "",
    accent: "text-zinc-700 dark:text-zinc-300",
    ring: "hover:border-zinc-300 dark:hover:border-zinc-700",
  },
] as const;

export default async function HomePage() {
  const workspaceId = await getActiveWorkspaceId();
  const workspace = workspaceId
    ? await db.workspace.findUnique({ where: { id: workspaceId } })
    : null;

  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);

  const events = workspaceId
    ? await db.event.findMany({
        where: {
          workspaceId,
          startsAt: { gte: weekStart, lt: weekEnd },
        },
        orderBy: { startsAt: "asc" },
        include: {
          tasks: { where: { status: { not: "DONE" } } },
          _count: { select: { drafts: true, metrics: true } },
        },
      })
    : [];

  /** Event the skill strip points at: this week first, else the closest one. */
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
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Open {focusEvent.title.length > 22 ? "event" : focusEvent.title} →
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
          <Card title="Skills">
            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
              Every skill is one call to <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">POST /api/ai</code>{" "}
              with a role. Suggestions are previewed in the event page; an officer confirms before
              anything is saved, and outbound messages always stop at Approvals.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {skills.map((skill) => {
                const href = focusEvent
                  ? `/events/${focusEvent.id}${skill.anchor}`
                  : "/approvals";
                return (
                  <Link
                    key={skill.role}
                    href={href}
                    className={`group flex h-full flex-col rounded-lg border border-zinc-200 bg-white p-3 transition hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 ${skill.ring}`}
                  >
                    <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      role: {skill.role}
                    </span>
                    <span className={`mt-1 text-sm font-semibold ${skill.accent}`}>
                      {skill.name}
                    </span>
                    <span className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {skill.tagline}
                    </span>
                    <span className="mt-2 text-xs text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                      Open →
                    </span>
                  </Link>
                );
              })}
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <p className="text-2xl font-semibold">{events.length}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Events this week</p>
            </Card>
            <Card>
              <p className="text-2xl font-semibold">{pendingDrafts}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Drafts awaiting action{" "}
                <Link href="/approvals" className="underline">
                  →
                </Link>
              </p>
            </Card>
            <Card>
              <p className="text-2xl font-semibold">{openFollowUps}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Open AFTERS follow-ups
                {focusEvent ? (
                  <>
                    {" "}
                    <Link href={`/events/${focusEvent.id}#afters`} className="underline">
                      →
                    </Link>
                  </>
                ) : null}
              </p>
            </Card>
          </div>

          <Card title="Events this week">
            {events.length > 0 ? (
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {events.map((event) => (
                  <li key={event.id} className="flex items-center justify-between gap-4 py-3">
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
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-xs text-zinc-500">
                        {event.tasks.length} open tasks · {event._count.metrics} metrics
                      </span>
                      <Link
                        href={`/events/${event.id}#afters`}
                        className="rounded-full border border-zinc-300 px-2.5 py-1 text-xs text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        AFTERS
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                <p>
                  No events scheduled this week. Create one below or run{" "}
                  <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">npm run db:seed</code>.
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
