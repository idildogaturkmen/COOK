import Link from "next/link";
import { notFound } from "next/navigation";
import { AftersAssist } from "@/components/assist/afters-assist";
import { OpsAssist } from "@/components/assist/ops-assist";
import { OutreachAssist } from "@/components/assist/outreach-assist";
import { AssistHeader } from "@/components/assist/ui";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import {
  createFollowUp,
  createMetric,
  createRunOfShowItem,
  createTask,
  toggleFollowUp,
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

function formatDueDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const statusLabel: Record<string, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

const eventStatusStyle: Record<string, string> = {
  PLANNING: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
};

const jumpLinks = [
  { href: "#tasks", label: "Tasks" },
  { href: "#run-of-show", label: "Run of show" },
  { href: "#ops-assist", label: "Ops Assist" },
  { href: "#outreach-assist", label: "Outreach Assist" },
  { href: "#afters", label: "AFTERS" },
] as const;

const inputClass =
  "rounded-md border border-zinc-300 px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900";

export default async function EventDetailPage({ params }: EventPageProps) {
  const { id } = await params;

  const event = await db.event.findUnique({
    where: { id },
    include: {
      tasks: { orderBy: { sortOrder: "asc" } },
      runOfShow: { orderBy: { sortOrder: "asc" } },
      metrics: { orderBy: { recordedAt: "desc" } },
      followUps: { orderBy: [{ completed: "asc" }, { dueAt: "asc" }] },
      workspace: true,
    },
  });

  if (!event) {
    notFound();
  }

  const createTaskAction = createTask.bind(null, event.id);
  const createRosAction = createRunOfShowItem.bind(null, event.id);
  const createMetricAction = createMetric.bind(null, event.id);
  const createFollowUpAction = createFollowUp.bind(null, event.id);

  const openFollowUps = event.followUps.filter((f) => !f.completed).length;

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
        <Link
          href="/approvals"
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Approvals
        </Link>
      </PageHeader>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${eventStatusStyle[event.status]}`}
        >
          {event.status.toLowerCase()}
        </span>
        <span className="text-xs text-zinc-500">
          {event.tasks.filter((t) => t.status !== "DONE").length} open tasks ·{" "}
          {event.metrics.length} metrics · {openFollowUps} open follow-ups
        </span>
        <nav aria-label="Jump to section" className="ml-auto flex flex-wrap gap-1.5">
          {jumpLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="space-y-6">
        <Card title="Brief">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {event.brief || "No brief yet. Add context for officers and partners."}
          </p>
        </Card>

        <Card title="Tasks">
          <div id="tasks" className="scroll-mt-24">
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
              <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                No tasks yet — add one below, or let Ops Assist suggest the standard checklist.
              </p>
            )}
            <form action={createTaskAction} className="flex flex-col gap-2 sm:flex-row">
              <input
                name="title"
                placeholder="Task title"
                aria-label="Task title"
                required
                className={`flex-1 ${inputClass}`}
              />
              <input
                name="assignee"
                placeholder="Assignee"
                aria-label="Assignee"
                className={`w-full sm:w-36 ${inputClass}`}
              />
              <button
                type="submit"
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                Add task
              </button>
            </form>
          </div>
        </Card>

        <Card title="Run of show">
          <div id="run-of-show" className="scroll-mt-24">
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
                      <td className="py-2 pr-4 font-mono text-xs whitespace-nowrap">{item.time}</td>
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
                aria-label="Time"
                required
                className={inputClass}
              />
              <input
                name="title"
                placeholder="Agenda item"
                aria-label="Agenda item"
                required
                className={`sm:col-span-2 ${inputClass}`}
              />
              <input
                name="notes"
                placeholder="Notes"
                aria-label="Notes"
                className={`sm:col-span-3 ${inputClass}`}
              />
              <button
                type="submit"
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                Add row
              </button>
            </form>
          </div>
        </Card>

        <OpsAssist eventId={event.id} />

        <OutreachAssist eventId={event.id} />

        <Card className="border-zinc-300 shadow-sm dark:border-zinc-700">
          <div id="afters" className="scroll-mt-24">
            <AssistHeader
              eyebrow="Skill · metrics"
              title="AFTERS"
              subtitle="After-event metrics, follow-ups, and debrief."
              badge="Confirm before save"
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Metrics
                </h3>
                {event.metrics.length > 0 ? (
                  <ul className="mb-3 divide-y divide-zinc-100 dark:divide-zinc-800">
                    {event.metrics.map((metric) => (
                      <li key={metric.id} className="flex items-baseline justify-between gap-3 py-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{metric.name}</p>
                          {metric.notes ? (
                            <p className="text-xs text-zinc-500">{metric.notes}</p>
                          ) : null}
                        </div>
                        <p className="shrink-0 tabular-nums">
                          <span className="text-lg font-semibold">
                            {metric.value ?? "—"}
                          </span>
                          {metric.unit ? (
                            <span className="ml-1 text-xs text-zinc-500">{metric.unit}</span>
                          ) : null}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mb-3 rounded-md border border-dashed border-zinc-300 px-3 py-4 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                    Start with one number: how many people showed up? Everything else reads against
                    attendance.
                  </p>
                )}

                <form action={createMetricAction} className="grid grid-cols-6 gap-2">
                  <input
                    name="name"
                    placeholder="attendance"
                    aria-label="Metric name"
                    required
                    className={`col-span-3 ${inputClass}`}
                  />
                  <input
                    name="value"
                    type="number"
                    step="any"
                    placeholder="31"
                    aria-label="Metric value"
                    className={`col-span-2 ${inputClass}`}
                  />
                  <input
                    name="unit"
                    placeholder="people"
                    aria-label="Metric unit"
                    className={`col-span-1 ${inputClass}`}
                  />
                  <input
                    name="notes"
                    placeholder="Notes (optional)"
                    aria-label="Metric notes"
                    className={`col-span-4 ${inputClass}`}
                  />
                  <button
                    type="submit"
                    className="col-span-2 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                  >
                    Log metric
                  </button>
                </form>
              </div>

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Follow-ups
                </h3>
                {event.followUps.length > 0 ? (
                  <ul className="mb-3 divide-y divide-zinc-100 dark:divide-zinc-800">
                    {event.followUps.map((followUp) => (
                      <li key={followUp.id} className="flex items-start justify-between gap-3 py-2">
                        <div className="min-w-0">
                          <p
                            className={`text-sm ${followUp.completed ? "text-zinc-500 line-through" : "font-medium"}`}
                          >
                            {followUp.title}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {followUp.dueAt ? `Due ${formatDueDate(followUp.dueAt)}` : "No due date"}
                            {followUp.notes ? ` · ${followUp.notes}` : ""}
                          </p>
                        </div>
                        <form action={toggleFollowUp.bind(null, followUp.id, event.id)}>
                          <button
                            type="submit"
                            aria-label={
                              followUp.completed
                                ? `Reopen ${followUp.title}`
                                : `Mark ${followUp.title} done`
                            }
                            className={`shrink-0 rounded border px-2 py-1 text-xs transition ${
                              followUp.completed
                                ? "border-green-300 text-green-700 dark:border-green-800 dark:text-green-300"
                                : "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                            }`}
                          >
                            {followUp.completed ? "✓ Done" : "Mark done"}
                          </button>
                        </form>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mb-3 rounded-md border border-dashed border-zinc-300 px-3 py-4 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                    No follow-ups yet. The classic three: thank-you in 48 hours, survey recap at one
                    week, re-invite at one month.
                  </p>
                )}

                <form action={createFollowUpAction} className="grid grid-cols-6 gap-2">
                  <input
                    name="title"
                    placeholder="Send thank-you note"
                    aria-label="Follow-up title"
                    required
                    className={`col-span-4 ${inputClass}`}
                  />
                  <input
                    name="dueAt"
                    type="date"
                    aria-label="Follow-up due date"
                    className={`col-span-2 ${inputClass}`}
                  />
                  <input
                    name="notes"
                    placeholder="Notes (optional)"
                    aria-label="Follow-up notes"
                    className={`col-span-4 ${inputClass}`}
                  />
                  <button
                    type="submit"
                    className="col-span-2 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                  >
                    Add follow-up
                  </button>
                </form>
              </div>
            </div>

            <AftersAssist eventId={event.id} />
          </div>
        </Card>
      </div>
    </>
  );
}
