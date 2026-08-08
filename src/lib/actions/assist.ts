"use server";

/**
 * Apply actions for the assist panels (Ops, Outreach, AFTERS).
 *
 * Nothing here runs automatically: each function is only called after an officer
 * ticks suggestions in the preview and presses Apply. Outbound messages are
 * created as `Draft` rows for the Approvals queue — never sent.
 */
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireActiveWorkspaceId } from "@/lib/workspace";

export type ApplyResult = {
  ok: boolean;
  message: string;
  created: { metrics: number; followUps: number; tasks: number; runOfShow: number; drafts: number };
};

const EMPTY_COUNTS: ApplyResult["created"] = {
  metrics: 0,
  followUps: 0,
  tasks: 0,
  runOfShow: 0,
  drafts: 0,
};

type MetricInput = { name: string; value?: number | null; unit?: string; notes?: string };
type FollowUpInput = { title: string; dueAt?: string; notes?: string };
type TaskInput = { title: string; assignee?: string; dueAt?: string; notes?: string };
type RunOfShowInput = { time: string; title: string; durationMin?: number; notes?: string };
type DraftInput = { channel: "EMAIL" | "SLACK"; subject?: string; body: string; status?: "DRAFT" | "AWAITING_APPROVAL" };

function clean(value: string | undefined | null, max = 2000): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function parseDate(value: string | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function summarize(created: ApplyResult["created"]): string {
  const parts: string[] = [];
  if (created.metrics) parts.push(`${created.metrics} metric${created.metrics === 1 ? "" : "s"}`);
  if (created.followUps)
    parts.push(`${created.followUps} follow-up${created.followUps === 1 ? "" : "s"}`);
  if (created.tasks) parts.push(`${created.tasks} task${created.tasks === 1 ? "" : "s"}`);
  if (created.runOfShow)
    parts.push(`${created.runOfShow} run-of-show row${created.runOfShow === 1 ? "" : "s"}`);
  if (created.drafts) parts.push(`${created.drafts} draft${created.drafts === 1 ? "" : "s"}`);
  return parts.length > 0 ? `Saved ${parts.join(", ")}.` : "Nothing selected — nothing saved.";
}

/** AFTERS: persist the suggestions an officer ticked in the preview. */
export async function applyAfters(
  eventId: string,
  payload: {
    metrics?: MetricInput[];
    followUps?: FollowUpInput[];
    thankYouDraft?: DraftInput | null;
    debriefNote?: DraftInput | null;
  },
): Promise<ApplyResult> {
  const workspaceId = await requireActiveWorkspaceId();
  const event = await db.event.findFirst({ where: { id: eventId, workspaceId } });
  if (!event) {
    return { ok: false, message: "Event not found in this workspace.", created: EMPTY_COUNTS };
  }

  const created = { ...EMPTY_COUNTS };

  for (const metric of payload.metrics ?? []) {
    const name = clean(metric.name, 120);
    if (!name) continue;
    await db.metric.create({
      data: {
        workspaceId,
        eventId,
        name,
        value: typeof metric.value === "number" && !Number.isNaN(metric.value) ? metric.value : null,
        unit: clean(metric.unit, 40),
        notes: clean(metric.notes),
      },
    });
    created.metrics += 1;
  }

  for (const followUp of payload.followUps ?? []) {
    const title = clean(followUp.title, 200);
    if (!title) continue;
    await db.followUp.create({
      data: {
        eventId,
        title,
        notes: clean(followUp.notes),
        dueAt: parseDate(followUp.dueAt),
      },
    });
    created.followUps += 1;
  }

  for (const draft of [payload.thankYouDraft, payload.debriefNote]) {
    if (!draft) continue;
    const body = clean(draft.body, 8000);
    if (!body) continue;
    await db.draft.create({
      data: {
        workspaceId,
        eventId,
        channel: draft.channel === "EMAIL" ? "EMAIL" : "SLACK",
        subject: clean(draft.subject, 200),
        body,
        status: draft.status === "DRAFT" ? "DRAFT" : "AWAITING_APPROVAL",
      },
    });
    created.drafts += 1;
  }

  revalidatePath(`/events/${eventId}`);
  if (created.drafts > 0) revalidatePath("/approvals");
  revalidatePath("/");

  return { ok: true, message: summarize(created), created };
}

/** Ops Assist: persist selected tasks / run-of-show rows. */
export async function applyOps(
  eventId: string,
  payload: { tasks?: TaskInput[]; runOfShow?: RunOfShowInput[] },
): Promise<ApplyResult> {
  const workspaceId = await requireActiveWorkspaceId();
  const event = await db.event.findFirst({ where: { id: eventId, workspaceId } });
  if (!event) {
    return { ok: false, message: "Event not found in this workspace.", created: EMPTY_COUNTS };
  }

  const created = { ...EMPTY_COUNTS };
  let taskOrder = await db.task.count({ where: { eventId } });
  let rosOrder = await db.runOfShowItem.count({ where: { eventId } });

  for (const task of payload.tasks ?? []) {
    const title = clean(task.title, 200);
    if (!title) continue;
    await db.task.create({
      data: {
        eventId,
        title,
        description: clean(task.notes),
        assignee: clean(task.assignee, 60),
        dueAt: parseDate(task.dueAt),
        sortOrder: taskOrder,
      },
    });
    taskOrder += 1;
    created.tasks += 1;
  }

  for (const item of payload.runOfShow ?? []) {
    const title = clean(item.title, 200);
    const time = clean(item.time, 40);
    if (!title || !time) continue;
    await db.runOfShowItem.create({
      data: {
        eventId,
        time,
        title,
        durationMin: typeof item.durationMin === "number" ? item.durationMin : null,
        notes: clean(item.notes),
        sortOrder: rosOrder,
      },
    });
    rosOrder += 1;
    created.runOfShow += 1;
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/");

  return { ok: true, message: summarize(created), created };
}

/** Outreach Assist: save selected messages as Approvals drafts. Never sends. */
export async function applyOutreachDrafts(
  eventId: string,
  drafts: DraftInput[],
): Promise<ApplyResult> {
  const workspaceId = await requireActiveWorkspaceId();
  const event = await db.event.findFirst({ where: { id: eventId, workspaceId } });
  if (!event) {
    return { ok: false, message: "Event not found in this workspace.", created: EMPTY_COUNTS };
  }

  const created = { ...EMPTY_COUNTS };

  for (const draft of drafts) {
    const body = clean(draft.body, 8000);
    if (!body) continue;
    await db.draft.create({
      data: {
        workspaceId,
        eventId,
        channel: draft.channel === "EMAIL" ? "EMAIL" : "SLACK",
        subject: clean(draft.subject, 200),
        body,
        status: draft.status === "DRAFT" ? "DRAFT" : "AWAITING_APPROVAL",
      },
    });
    created.drafts += 1;
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/approvals");
  revalidatePath("/");

  return {
    ok: true,
    message:
      created.drafts > 0
        ? `${summarize(created)} Waiting for you in Approvals — nothing was sent.`
        : summarize(created),
    created,
  };
}
