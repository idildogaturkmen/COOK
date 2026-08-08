import Link from "next/link";
import { Card } from "@/components/card";
import { Chip } from "@/components/chip";
import { PageHeader } from "@/components/page-header";
import { createDraft, updateDraftStatus } from "@/lib/actions/crud";
import { db } from "@/lib/db";
import { getActiveWorkspaceId } from "@/lib/workspace";

const statusTone = {
  DRAFT: "zinc",
  AWAITING_APPROVAL: "amber",
  SENT: "green",
  REJECTED: "red",
} as const;

const statusLabel: Record<string, string> = {
  DRAFT: "Draft",
  AWAITING_APPROVAL: "Awaiting approval",
  SENT: "Sent",
  REJECTED: "Rejected",
};

const statusRank: Record<string, number> = {
  AWAITING_APPROVAL: 0,
  DRAFT: 1,
  SENT: 2,
  REJECTED: 3,
};

export default async function ApprovalsPage() {
  const workspaceId = await getActiveWorkspaceId();

  const drafts = workspaceId
    ? (
        await db.draft.findMany({
          where: { workspaceId },
          orderBy: { updatedAt: "desc" },
          include: { event: { select: { id: true, title: true } } },
        })
      ).sort((a, b) => statusRank[a.status] - statusRank[b.status])
    : [];

  const awaiting = drafts.filter((d) => d.status === "AWAITING_APPROVAL").length;
  const inDraft = drafts.filter((d) => d.status === "DRAFT").length;
  const sent = drafts.filter((d) => d.status === "SENT").length;

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
        description="Every message an officer or a skill writes stops here. Nothing is sent automatically."
      >
        <Link
          href="/"
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          ← Home
        </Link>
      </PageHeader>

      {workspaceId ? (
        <div className="mb-6 flex flex-col gap-2 border-y border-zinc-200 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone="amber" dot>
              {awaiting} awaiting approval
            </Chip>
            <Chip dot>{inDraft} in draft</Chip>
            <Chip tone="green" dot>
              {sent} sent
            </Chip>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Drafts from Outreach Assist and AFTERS arrive here as “awaiting approval”.
          </p>
        </div>
      ) : null}

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
            <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
              Approving records the decision and marks the draft sent. Gmail and Slack delivery is
              not wired up, so the club stays in control of what actually goes out.
            </p>
            {drafts.length > 0 ? (
              <ul className="space-y-4">
                {drafts.map((draft) => (
                  <li
                    key={draft.id}
                    className={`rounded-lg border p-4 transition ${
                      draft.status === "AWAITING_APPROVAL"
                        ? "border-amber-300 bg-amber-50/40 dark:border-amber-900/60 dark:bg-amber-950/20"
                        : "border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Chip tone={draft.channel === "SLACK" ? "violet" : "blue"}>
                        {draft.channel === "SLACK" ? "# Slack" : "✉ Email"}
                      </Chip>
                      <Chip tone={statusTone[draft.status]} dot>
                        {statusLabel[draft.status]}
                      </Chip>
                      {draft.event ? (
                        <Link
                          href={`/events/${draft.event.id}`}
                          className="text-xs text-zinc-500 underline-offset-2 hover:underline"
                        >
                          · {draft.event.title}
                        </Link>
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
                                Approve &amp; mark sent
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
