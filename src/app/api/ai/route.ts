import { NextResponse } from "next/server";
import { runSkill } from "@/lib/ai/router";
import { type AiRequest, type AiRole } from "@/lib/ai/types";

const VALID_ROLES: AiRole[] = ["ops", "outreach", "metrics", "manager"];

function isAiRole(value: unknown): value is AiRole {
  return typeof value === "string" && VALID_ROLES.includes(value as AiRole);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Request body required" }, { status: 400 });
  }

  const { role, eventId, input } = body as Partial<AiRequest>;

  if (!isAiRole(role)) {
    return NextResponse.json(
      { error: 'role must be one of: "ops" | "outreach" | "metrics" | "manager"' },
      { status: 400 },
    );
  }

  if (typeof input !== "string" || !input.trim()) {
    return NextResponse.json({ error: "input must be a non-empty string" }, { status: 400 });
  }

  if (eventId !== undefined && typeof eventId !== "string") {
    return NextResponse.json({ error: "eventId must be a string when provided" }, { status: 400 });
  }

  const aiRequest: AiRequest = { role, eventId, input: input.trim() };

  try {
    const outcome = await runSkill(aiRequest);
    if (!outcome.ok) {
      return NextResponse.json({ error: outcome.error }, { status: outcome.status });
    }
    return NextResponse.json(outcome.response);
  } catch (error) {
    console.error("[/api/ai] skill failed", error);
    return NextResponse.json({ error: "Skill handler failed" }, { status: 500 });
  }
}
