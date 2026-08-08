"use client";

import { useCallback, useState } from "react";
import type { AiResponse, AiRole } from "@/lib/ai/types";

export type AssistPhase = "idle" | "loading" | "preview" | "applying" | "done" | "error";

/**
 * Calls the single AI entrypoint (`POST /api/ai`) and holds the preview.
 * Nothing is persisted here — apply actions are separate server actions.
 */
export function useAssist<TData>(role: AiRole, eventId: string) {
  const [phase, setPhase] = useState<AssistPhase>("idle");
  const [response, setResponse] = useState<AiResponse<TData> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const generate = useCallback(
    async (input: string) => {
      setPhase("loading");
      setError(null);
      setResult(null);
      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role, eventId, input }),
        });
        const json = await res.json();
        if (!res.ok) {
          setError(typeof json?.error === "string" ? json.error : "Request failed");
          setPhase("error");
          return;
        }
        setResponse(json as AiResponse<TData>);
        setPhase("preview");
      } catch {
        setError("Could not reach /api/ai. Is the dev server running?");
        setPhase("error");
      }
    },
    [eventId, role],
  );

  const dismiss = useCallback(() => {
    setResponse(null);
    setError(null);
    setResult(null);
    setPhase("idle");
  }, []);

  return {
    phase,
    setPhase,
    response,
    error,
    setError,
    result,
    setResult,
    generate,
    dismiss,
  };
}
