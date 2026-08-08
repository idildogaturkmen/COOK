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
          _count: { select: { drafts: true } },
        },
      })
    : [];

  const pendingDrafts = workspaceId
    ? await db.draft.count({
        where: {
          workspaceId,
          status: { in: ["DRAFT", "AWAITING_APPROVAL"] },
        },
      })
    : 0;

  return (
    <>
      <PageHeader
        title="This week"
        description={
          workspace
            ? `${workspace.name} — events and ops digest`
            : "Create a workspace to get started"
        }
      />

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
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <p className="text-2xl font-semibold">{events.length}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Events this week</p>
            </Card>
            <Card>
              <p className="text-2xl font-semibold">
                {events.reduce((n, e) => n + e.tasks.length, 0)}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Open tasks</p>
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
          </div>

          <Card title="Events this week">
            {events.length > 0 ? (
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {events.map((event) => (
                  <li key={event.id} className="flex items-center justify-between py-3">
                    <div>
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
                    <span className="text-xs text-zinc-500">
                      {event.tasks.length} open tasks
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No events scheduled this week. Create one below or run{" "}
                <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">npm run db:seed</code>.
              </p>
            )}
          </Card>

          <Card title="New event">
            <form action={createEvent} className="grid gap-3 sm:grid-cols-2">
              <input
                name="title"
                placeholder="Event title"
                required
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 sm:col-span-2"
              />
              <input
                name="startsAt"
                type="datetime-local"
                required
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
              <input
                name="location"
                placeholder="Location"
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
              <textarea
                name="brief"
                placeholder="Brief (goals, audience, notes)"
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
