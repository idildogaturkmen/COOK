export type AiRole = "ops" | "outreach" | "metrics" | "manager";

export type AiRequest = {
  role: AiRole;
  eventId?: string;
  input: string;
};

/** Metric suggestion. `value` is optional so officers can fill in real numbers. */
export type MetricSuggestion = {
  name: string;
  value?: number | null;
  unit?: string;
  notes?: string;
};

export type FollowUpSuggestion = {
  title: string;
  /** ISO-8601 timestamp */
  dueAt?: string;
  notes?: string;
};

export type DebriefSuggestion = {
  wentWell: string[];
  improve: string[];
  quotes: string[];
  nextEventIdeas: string[];
};

/** A message an officer may turn into an Approvals draft. Never auto-sent. */
export type DraftPreview = {
  channel: "EMAIL" | "SLACK";
  subject?: string;
  body: string;
};

/**
 * AFTERS payload (API role `metrics`).
 * AFTERS is the product name for the after-event/debrief experience.
 */
export type MetricsData = {
  metrics: MetricSuggestion[];
  followUps: FollowUpSuggestion[];
  debrief: DebriefSuggestion;
  surveyQuestions?: string[];
  insights?: string[];
  draftPreview?: DraftPreview;
};

export type TaskSuggestion = {
  title: string;
  assignee?: string;
  /** ISO-8601 timestamp */
  dueAt?: string;
  notes?: string;
};

export type RunOfShowSuggestion = {
  time: string;
  title: string;
  durationMin?: number;
  notes?: string;
};

/** Ops Assist payload (API role `ops`). */
export type OpsData = {
  tasks: TaskSuggestion[];
  runOfShow: RunOfShowSuggestion[];
  risks?: string[];
};

/** Outreach Assist payload (API role `outreach`). Drafts land in Approvals. */
export type OutreachData = {
  drafts: (DraftPreview & { label?: string; suggestedStatus?: "DRAFT" | "AWAITING_APPROVAL" })[];
  notes?: string[];
};

export type AiResponse<TData = Record<string, unknown>> = {
  role: AiRole;
  eventId?: string;
  summary: string;
  suggestions: string[];
  /** Structured skill output — shape varies by role */
  data: TData;
  /** `false` once a real handler produced this response */
  stub: boolean;
};

export type MetricsResponse = AiResponse<MetricsData>;
export type OpsResponse = AiResponse<OpsData>;
export type OutreachResponse = AiResponse<OutreachData>;

export function buildStubResponse(request: AiRequest): AiResponse {
  const roleMessages: Record<AiRole, string> = {
    ops: "Ops skill stub: would analyze tasks and run-of-show for this event.",
    outreach:
      "Outreach skill stub: would draft partner emails or Slack messages for approval.",
    metrics:
      "AFTERS stub: would suggest metrics, follow-ups, and a debrief for this event.",
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
