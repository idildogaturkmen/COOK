import Link from "next/link";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { createDraft, updateDraftStatus } from "@/lib/actions/crud";
import { db } from "@/lib/db";
import { getActiveWorkspaceId } from "@/lib/workspace";

const statusColors: Record<string, string> = {
  DRAFT: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  AWAITING_APPROVAL: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  SENT: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
};

const statusLabel: Record<string, string> = {
  DRAFT: "Draft",
  AWAITING_APPROVAL: "Awaiting approval",
  SENT: "Sent",
  REJECTED: "Rejected",
};

export default async function ApprovalsPage() {
  const workspaceId = await getActiveWorkspaceId();

  const drafts = workspaceId
    ? await db.draft.findMany({
        where: { workspaceId },
        orderBy: { updatedAt: "desc" },
        include: { event: { select: { title: true } } },
      })
    : [];

  const events = workspaceId
    ? await db.event.findMany({
        where: { workspaceId },
        orderBy: { startsAt: "desc" },
        select: { id: true, title: true },
      })
    : [];

  return (
    <>
      <PageHeader
        title="Approvals"
        description="Draft queue for email and Slack outreach. Approve before send — no auto-send in M1."
      />

      {!workspaceId ? (
        <Card>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Create a workspace on the{" "}
            <Link href="/" className="underline">
              Home
            </Link>{" "}
            screen first.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card title="Create draft">
            <form action={createDraft} className="grid gap-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  name="channel"
                  defaultValue="EMAIL"
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <option value="EMAIL">Email</option>
                  <option value="SLACK">Slack</option>
                </select>
                <select
                  name="eventId"
                  defaultValue=""
                  className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <option value="">No linked event</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </select>
              </div>
              <input
                name="subject"
                placeholder="Subject (email only)"
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
              <textarea
                name="body"
                placeholder="Draft message body"
                required
                rows={4}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
              <button
                type="submit"
                className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                Save draft
              </button>
            </form>
          </Card>

          <Card title="Draft queue">
            {drafts.length > 0 ? (
              <ul className="space-y-4">
                {drafts.map((draft) => (
                  <li
                    key={draft.id}
                    className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium uppercase text-zinc-500">
                        {draft.channel}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[draft.status]}`}
                      >
                        {statusLabel[draft.status]}
                      </span>
                      {draft.event ? (
                        <span className="text-xs text-zinc-500">· {draft.event.title}</span>
                      ) : null}
                    </div>
                    {draft.subject ? (
                      <p className="mb-1 font-medium">{draft.subject}</p>
                    ) : null}
                    <p className="mb-3 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                      {draft.body}
                    </p>
                    {draft.status !== "SENT" && draft.status !== "REJECTED" ? (
                      <div className="flex flex-wrap gap-2">
                        {draft.status === "DRAFT" ? (
                          <form
                            action={updateDraftStatus.bind(
                              null,
                              draft.id,
                              "AWAITING_APPROVAL",
                            )}
                          >
                            <button
                              type="submit"
                              className="rounded border border-amber-400 px-3 py-1 text-xs font-medium text-amber-800 dark:text-amber-200"
                            >
                              Submit for approval
                            </button>
                          </form>
                        ) : null}
                        {draft.status === "AWAITING_APPROVAL" ? (
                          <>
                            <form
                              action={updateDraftStatus.bind(null, draft.id, "SENT")}
                            >
                              <button
                                type="submit"
                                className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white"
                              >
                                Approve (stub send)
                              </button>
                            </form>
                            <form
                              action={updateDraftStatus.bind(null, draft.id, "REJECTED")}
                            >
                              <button
                                type="submit"
                                className="rounded border border-red-400 px-3 py-1 text-xs font-medium text-red-700 dark:text-red-300"
                              >
                                Reject
                              </button>
                            </form>
                          </>
                        ) : null}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No drafts yet. Create one above or run the seed script for a sample.
              </p>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
