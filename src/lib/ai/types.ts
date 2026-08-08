export type AiRole = "ops" | "outreach" | "metrics" | "manager";

export type AiRequest = {
  role: AiRole;
  eventId?: string;
  input: string;
};

export type AiResponse = {
  role: AiRole;
  eventId?: string;
  summary: string;
  suggestions: string[];
  /** Placeholder for structured skill output — shape varies by role */
  data: Record<string, unknown>;
  stub: true;
};

export function buildStubResponse(request: AiRequest): AiResponse {
  const roleMessages: Record<AiRole, string> = {
    ops: "Ops skill stub: would analyze tasks and run-of-show for this event.",
    outreach:
      "Outreach skill stub: would draft partner emails or Slack messages for approval.",
    metrics:
      "Metrics skill stub: would suggest follow-ups based on event attendance data.",
    manager:
      "Manager stub: would route to the appropriate skill based on intent.",
  };

  return {
    role: request.role,
    eventId: request.eventId,
    summary: roleMessages[request.role],
    suggestions: [
      "Connect a real LLM provider in POST /api/ai",
      `Implement skills/${request.role === "manager" ? "ops" : request.role}/SKILL.md`,
      "Keep approve-before-send for all outreach drafts",
    ],
    data: {
      inputReceived: request.input,
      processedAt: new Date().toISOString(),
    },
    stub: true,
  };
}
