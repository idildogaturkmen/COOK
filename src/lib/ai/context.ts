import { db } from "@/lib/db";

/**
 * Event context shared by every skill handler.
 *
 * Deliberately narrow: only generic operational fields (titles, counts, status,
 * goals from the brief). No member names, emails, or other PII is collected here
 * so the same context object is safe to pass to a future LLM provider.
 */
export type EventContext = Awaited<ReturnType<typeof loadEventContext>>;

export async function loadEventContext(eventId: string) {
  const event = await db.event.findUnique({
    where: { id: eventId },
    include: {
      workspace: { select: { id: true, name: true } },
      tasks: { orderBy: { sortOrder: "asc" } },
      runOfShow: { orderBy: { sortOrder: "asc" } },
      metrics: { orderBy: { recordedAt: "desc" } },
      followUps: { orderBy: { completed: "asc" } },
    },
  });

  return event;
}

/** Pull `- bullet` lines that follow a "Goals:" heading in the event brief. */
export function extractGoals(brief: string | null | undefined): string[] {
  if (!brief) return [];

  const lines = brief.split("\n");
  const goals: string[] = [];
  let collecting = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^goals?\s*:/i.test(trimmed)) {
      collecting = true;
      continue;
    }
    if (!collecting) continue;
    if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
      goals.push(trimmed.replace(/^[-*]\s*/, ""));
      continue;
    }
    if (trimmed === "") continue;
    break;
  }

  return goals;
}

/** First sentence of the brief, used for short summaries. */
export function briefHeadline(brief: string | null | undefined): string | null {
  if (!brief) return null;
  const firstLine = brief.split("\n").find((line) => line.trim().length > 0);
  if (!firstLine) return null;
  const sentence = firstLine.split(/(?<=\.)\s/)[0]?.trim() ?? firstLine.trim();
  return sentence.length > 180 ? `${sentence.slice(0, 177)}…` : sentence;
}

export function addDays(from: Date, days: number): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
