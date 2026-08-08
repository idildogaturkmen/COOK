/**
 * Outreach Assist — deterministic v1.
 *
 * Produces message previews only. Applying one creates a `Draft` row that shows
 * up in Approvals; nothing is ever sent from here. Contract lives in
 * `skills/outreach/SKILL.md`.
 */
import { extractGoals, formatShortDate, type EventContext } from "@/lib/ai/context";
import type { AiRequest, OutreachResponse } from "@/lib/ai/types";

type Intent = "announce" | "reminder" | "partner" | "recruit";

export function parseIntent(input: string): Intent {
  const text = input.toLowerCase();
  if (/partner|sponsor|host|venue|makerspace/.test(text)) return "partner";
  if (/remind|24h|tomorrow|last call/.test(text)) return "reminder";
  if (/recruit|mentor|volunteer|help/.test(text)) return "recruit";
  return "announce";
}

function eventFacts(event: EventContext) {
  const title = event?.title ?? "our next club event";
  const when = event?.startsAt
    ? `${event.startsAt.toLocaleDateString("en-US", { weekday: "long" })} ${formatShortDate(event.startsAt)} at ${event.startsAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
    : "soon";
  const where = event?.location ?? "TBD";
  const goals = extractGoals(event?.brief);
  return { title, when, where, goals };
}

export function runOutreachSkill(request: AiRequest, event: EventContext): OutreachResponse {
  const intent = parseIntent(request.input);
  const { title, when, where, goals } = eventFacts(event);
  const hook = goals[0] ? goals[0].toLowerCase() : "get something unstuck with people who can help";

  type DraftOption = {
    label: string;
    channel: "EMAIL" | "SLACK";
    subject: string;
    body: string;
  };

  const announcement: DraftOption = {
    label: "Slack announcement (#general)",
    channel: "SLACK",
    subject: `Announcement — ${title}`,
    body: [
      `📣 ${title} — ${when}, ${where}.`,
      "",
      `Come ${hook}. Newcomers welcome; you do not need to bring anything finished.`,
      "",
      "React with :raised_hands: if you are coming so we can size the snack run.",
    ].join("\n"),
  };

  const reminder: DraftOption = {
    label: "24-hour reminder (#general)",
    channel: "SLACK",
    subject: `Reminder — ${title} is tomorrow`,
    body: [
      `⏰ Reminder: ${title} is tomorrow, ${when}, in ${where}.`,
      "",
      "Bring a laptop and the thing you are stuck on. Officers will be at the door to point you at someone who can help.",
      "",
      "Cannot make it? Reply here and we will send the recap.",
    ].join("\n"),
  };

  const partner: DraftOption = {
    label: "Partner / venue email",
    channel: "EMAIL",
    subject: `${title} — quick confirmation`,
    body: [
      "Hi there,",
      "",
      `We are running ${title} on ${when} in ${where}. Two quick asks:`,
      "",
      "1. Can you confirm room access and AV setup for that window?",
      "2. Would you like us to credit you as host in the announcement?",
      "",
      "Happy to share a short recap with attendance numbers afterwards.",
      "",
      "Thanks,",
      "The officer team",
    ].join("\n"),
  };

  const recruit: DraftOption = {
    label: "Mentor / volunteer call (#officers)",
    channel: "SLACK",
    subject: `Mentors needed — ${title}`,
    body: [
      `🙋 Looking for 2 mentors for ${title} (${when}, ${where}).`,
      "",
      "You do not need to prep anything — sit with someone for ten minutes and help them get unblocked. It is the highest-leverage hour of the week.",
      "",
      "Reply with a :hand: and we will add you to the pairing sheet.",
    ].join("\n"),
  };

  const byIntent: Record<Intent, DraftOption[]> = {
    announce: [announcement, reminder],
    reminder: [reminder, announcement],
    partner: [partner, announcement],
    recruit: [recruit, announcement],
  };

  const drafts = byIntent[intent].map((draft) => ({
    ...draft,
    suggestedStatus: "AWAITING_APPROVAL" as const,
  }));

  return {
    role: "outreach",
    eventId: request.eventId,
    summary: event
      ? `Outreach Assist drafted ${drafts.length} message${drafts.length === 1 ? "" : "s"} for ${title}. Applying saves a draft to Approvals — nothing sends automatically.`
      : "Outreach Assist drafted generic club messages (no event linked). Applying saves a draft to Approvals.",
    suggestions: [
      "Edit the copy in Approvals before you approve it.",
      "Slack announcements land best 3–4 days out, with a reminder 24 hours before.",
      "Approve-before-send is enforced: the app never posts on its own.",
    ],
    data: {
      drafts,
      notes: [
        "Drafts are created with status AWAITING_APPROVAL so they surface in the Approvals queue.",
        "No attendee names or emails are used in generated copy.",
      ],
    },
    stub: false,
  };
}
