import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import {
  createRunOfShowItem,
  createTask,
  toggleTaskStatus,
} from "@/lib/actions/crud";
import { db } from "@/lib/db";

type EventPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(date: Date): string {
  return date.toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const statusLabel: Record<string, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

export default async function EventDetailPage({ params }: EventPageProps) {
  const { id } = await params;

  const event = await db.event.findUnique({
    where: { id },
    include: {
      tasks: { orderBy: { sortOrder: "asc" } },
      runOfShow: { orderBy: { sortOrder: "asc" } },
      workspace: true,
    },
  });

  if (!event) {
    notFound();
  }

  const createTaskAction = createTask.bind(null, event.id);
  const createRosAction = createRunOfShowItem.bind(null, event.id);

  return (
    <>
      <PageHeader
        title={event.title}
        description={`${event.workspace.name} · ${formatDate(event.startsAt)}${event.location ? ` · ${event.location}` : ""}`}
      >
        <Link
          href="/"
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          ← Home
        </Link>
      </PageHeader>

      <div className="space-y-6">
        <Card title="Brief">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {event.brief || "No brief yet. Add context for officers and partners."}
          </p>
        </Card>

        <Card title="Tasks">
          {event.tasks.length > 0 ? (
            <ul className="mb-4 divide-y divide-zinc-100 dark:divide-zinc-800">
              {event.tasks.map((task) => (
                <li key={task.id} className="flex items-center justify-between gap-4 py-2">
                  <div>
                    <p className={task.status === "DONE" ? "line-through text-zinc-500" : ""}>
                      {task.title}
                    </p>
                    {task.assignee ? (
                      <p className="text-xs text-zinc-500">@{task.assignee}</p>
                    ) : null}
                  </div>
                  <form action={toggleTaskStatus.bind(null, task.id, event.id)}>
                    <button
                      type="submit"
                      className="rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700"
                    >
                      {statusLabel[task.status]}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">No tasks yet.</p>
          )}
          <form action={createTaskAction} className="flex flex-col gap-2 sm:flex-row">
            <input
              name="title"
              placeholder="Task title"
              required
              className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              name="assignee"
              placeholder="Assignee"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 sm:w-36"
            />
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Add task
            </button>
          </form>
        </Card>

        <Card title="Run of show">
          {event.runOfShow.length > 0 ? (
            <table className="mb-4 w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase text-zinc-500">
                  <th className="pb-2 pr-4">Time</th>
                  <th className="pb-2 pr-4">Item</th>
                  <th className="pb-2">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {event.runOfShow.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 pr-4 font-mono text-xs">{item.time}</td>
                    <td className="py-2 pr-4">{item.title}</td>
                    <td className="py-2 text-zinc-600 dark:text-zinc-400">{item.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
              No run-of-show items yet.
            </p>
          )}
          <form action={createRosAction} className="grid gap-2 sm:grid-cols-4">
            <input
              name="time"
              placeholder="6:00 PM"
              required
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              name="title"
              placeholder="Agenda item"
              required
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 sm:col-span-2"
            />
            <input
              name="notes"
              placeholder="Notes"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 sm:col-span-3"
            />
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Add row
            </button>
          </form>
        </Card>
      </div>
    </>
  );
}
