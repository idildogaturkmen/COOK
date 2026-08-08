/**
 * Skill router used by `POST /api/ai`.
 *
 * The route owns request validation; this module owns loading event context once
 * and dispatching to the right handler. `ops`, `outreach`, and `metrics`
 * (AFTERS) have real deterministic handlers, so they return `stub: false` with
 * no API key. `manager` returns a routing recommendation.
 */
import { loadEventContext } from "@/lib/ai/context";
import { runAftersSkill } from "@/lib/ai/metrics/handler";
import { runOpsSkill } from "@/lib/ai/ops/handler";
import { runOutreachSkill } from "@/lib/ai/outreach/handler";
import {
  type AiRequest,
  type AiResponse,
  type MetricsResponse,
  type OpsResponse,
  type OutreachResponse,
} from "@/lib/ai/types";

export type SkillResponse = MetricsResponse | OpsResponse | OutreachResponse | AiResponse;

export type SkillOutcome =
  | { ok: true; response: SkillResponse }
  | { ok: false; status: number; error: string };

/** Keyword → role routing for the `manager` role. */
function routeIntent(input: string): { role: "ops" | "outreach" | "metrics"; reason: string } {
  const text = input.toLowerCase();
  if (/debrief|retro|recap|attendance|metric|follow[-\s]?up|survey|after/.test(text)) {
    return {
      role: "metrics",
      reason: "Mentions after-event work (debrief, metrics, follow-ups) — that is AFTERS.",
    };
  }
  if (/email|slack|message|invite|announce|partner|remind|thank/.test(text)) {
    return {
      role: "outreach",
      reason: "Mentions outbound messaging — Outreach drafts it, Approvals sends it.",
    };
  }
  return {
    role: "ops",
    reason: "Reads like planning or logistics — Ops covers tasks and run of show.",
  };
}

function runManagerSkill(request: AiRequest): AiResponse {
  const routed = routeIntent(request.input);
  const uiName = routed.role === "metrics" ? "AFTERS (metrics)" : routed.role;

  return {
    role: "manager",
    eventId: request.eventId,
    summary: `Route this to ${uiName}. ${routed.reason}`,
    suggestions: [
      `Call POST /api/ai with role: "${routed.role}" and the same input.`,
      "One entrypoint, one router — the UI never shows five separate chatbots.",
      "Officers always confirm before anything is persisted or sent.",
    ],
    data: {
      route: routed.role,
      uiName,
      reason: routed.reason,
      inputReceived: request.input,
    },
    stub: false,
  };
}

export async function runSkill(request: AiRequest): Promise<SkillOutcome> {
  if (request.role === "manager") {
    return { ok: true, response: runManagerSkill(request) };
  }

  let event = null as Awaited<ReturnType<typeof loadEventContext>>;
  if (request.eventId) {
    event = await loadEventContext(request.eventId);
    if (!event) {
      return { ok: false, status: 404, error: `Event not found: ${request.eventId}` };
    }
  }

  switch (request.role) {
    case "metrics":
      return { ok: true, response: runAftersSkill(request, event) };
    case "ops":
      return { ok: true, response: runOpsSkill(request, event) };
    case "outreach":
      return { ok: true, response: runOutreachSkill(request, event) };
  }
}
