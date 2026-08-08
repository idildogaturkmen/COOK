"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireActiveWorkspaceId } from "@/lib/workspace";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createWorkspace(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const baseSlug = slugify(name) || "workspace";
  let slug = baseSlug;
  let attempt = 0;
  while (await db.workspace.findUnique({ where: { slug } })) {
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  await db.workspace.create({
    data: {
      name,
      slug,
      members: {
        create: {
          email: "officer@club.example",
          name: "Dev Officer",
          role: "OWNER",
        },
      },
    },
  });

  revalidatePath("/");
}

export async function createEvent(formData: FormData): Promise<void> {
  const workspaceId = await requireActiveWorkspaceId();
  const title = String(formData.get("title") ?? "").trim();
  const startsAtRaw = String(formData.get("startsAt") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim() || null;
  const brief = String(formData.get("brief") ?? "").trim() || null;

  if (!title || !startsAtRaw) return;

  const event = await db.event.create({
    data: {
      workspaceId,
      title,
      brief,
      location,
      startsAt: new Date(startsAtRaw),
    },
  });

  revalidatePath("/");
  revalidatePath(`/events/${event.id}`);
}

export async function createTask(eventId: string, formData: FormData): Promise<void> {
  const title = String(formData.get("title") ?? "").trim();
  const assignee = String(formData.get("assignee") ?? "").trim() || null;

  if (!title) return;

  const count = await db.task.count({ where: { eventId } });

  await db.task.create({
    data: {
      eventId,
      title,
      assignee,
      sortOrder: count,
    },
  });

  revalidatePath(`/events/${eventId}`);
}

export async function createRunOfShowItem(eventId: string, formData: FormData): Promise<void> {
  const time = String(formData.get("time") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!time || !title) return;

  const count = await db.runOfShowItem.count({ where: { eventId } });

  await db.runOfShowItem.create({
    data: {
      eventId,
      time,
      title,
      notes,
      sortOrder: count,
    },
  });

  revalidatePath(`/events/${eventId}`);
}

export async function createDraft(formData: FormData): Promise<void> {
  const workspaceId = await requireActiveWorkspaceId();
  const channel = String(formData.get("channel") ?? "EMAIL").toUpperCase();
  const subject = String(formData.get("subject") ?? "").trim() || null;
  const body = String(formData.get("body") ?? "").trim();
  const eventId = String(formData.get("eventId") ?? "").trim() || null;

  if (!body) return;
  if (channel !== "EMAIL" && channel !== "SLACK") return;

  await db.draft.create({
    data: {
      workspaceId,
      eventId: eventId || null,
      channel: channel as "EMAIL" | "SLACK",
      subject,
      body,
      status: "DRAFT",
    },
  });

  revalidatePath("/approvals");
}

export async function updateDraftStatus(
  draftId: string,
  status: "DRAFT" | "AWAITING_APPROVAL" | "SENT" | "REJECTED",
): Promise<void> {
  await db.draft.update({
    where: { id: draftId },
    data: { status },
  });

  revalidatePath("/approvals");
}

export async function toggleTaskStatus(taskId: string, eventId: string): Promise<void> {
  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task) return;

  const next =
    task.status === "TODO"
      ? "IN_PROGRESS"
      : task.status === "IN_PROGRESS"
        ? "DONE"
        : "TODO";

  await db.task.update({
    where: { id: taskId },
    data: { status: next },
  });

  revalidatePath(`/events/${eventId}`);
}

