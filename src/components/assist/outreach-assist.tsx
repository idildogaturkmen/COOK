"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ApplyButton,
  AssistHeader,
  CheckRow,
  ErrorBanner,
  GenerateButton,
  PreviewSection,
  PreviewShell,
  QuietButton,
  ResultBanner,
} from "@/components/assist/ui";
import { useAssist } from "@/components/assist/use-assist";
import { Card } from "@/components/card";
import { applyOutreachDrafts } from "@/lib/actions/assist";
import type { OutreachData } from "@/lib/ai/types";

const PRESETS = [
  { label: "Announce the event", input: "Draft a Slack announcement for this event" },
  { label: "24h reminder", input: "Draft a reminder for 24 hours before the event" },
  { label: "Partner / venue", input: "Draft a partner email confirming the venue and AV" },
  { label: "Recruit mentors", input: "Draft a call for mentors and volunteers" },
] as const;

export function OutreachAssist({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { phase, setPhase, response, error, setError, result, setResult, generate, dismiss } =
    useAssist<OutreachData>("outreach", eventId);

  const [picked, setPicked] = useState<Set<number>>(new Set([0]));
  const [preset, setPreset] = useState<string>(PRESETS[0].input);

  const data = response?.data;

  async function handleGenerate(input: string) {
    setPreset(input);
    setPicked(new Set([0]));
    await generate(input);
  }

  function toggle(index: number) {
    const next = new Set(picked);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setPicked(next);
  }

  async function handleApply() {
    if (!data) return;
    setPhase("applying");
    setError(null);
    try {
      const res = await applyOutreachDrafts(
        eventId,
        [...picked].map((i) => ({
          channel: data.drafts[i].channel,
          subject: data.drafts[i].subject,
          body: data.drafts[i].body,
          status: data.drafts[i].suggestedStatus ?? "AWAITING_APPROVAL",
        })),
      );
      if (!res.ok) {
        setError(res.message);
        setPhase("error");
        return;
      }
      setResult(res.message);
      setPhase("done");
      router.refresh();
    } catch {
      setError("Could not save. Check the server logs and try again.");
      setPhase("error");
    }
  }

  return (
    <Card>
      <div id="outreach-assist" className="scroll-mt-24">
        <AssistHeader
          accent="violet"
          role="outreach"
          title="Outreach Assist"
          helper="Writes the Slack post or partner email. Applying queues a draft in Approvals — nothing sends."
          badge="Never auto-sends"
        />

        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Pick an angle
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((option) => (
            <button
              key={option.input}
              type="button"
              onClick={() => handleGenerate(option.input)}
              disabled={phase === "loading"}
              aria-pressed={preset === option.input}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:opacity-60 ${
                preset === option.input && phase !== "idle"
                  ? "border-zinc-400 bg-zinc-100 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <GenerateButton
            onClick={() => handleGenerate(preset)}
            loading={phase === "loading"}
            loadingLabel="Drafting…"
          >
            ✉️ Draft outreach
          </GenerateButton>
        </div>

        {phase === "error" && error ? <ErrorBanner message={error} /> : null}
        {phase === "done" && result ? (
          <ResultBanner message={result} showApprovalsLink onDone={dismiss} />
        ) : null}

        {(phase === "preview" || phase === "applying") && data && response ? (
          <PreviewShell
            summary={response.summary}
            footer={
              <>
                <ApplyButton
                  onClick={handleApply}
                  saving={phase === "applying"}
                  disabled={phase === "applying" || picked.size === 0}
                >
                  {`Save ${picked.size} draft${picked.size === 1 ? "" : "s"} to Approvals`}
                </ApplyButton>
                <QuietButton onClick={dismiss} disabled={phase === "applying"}>
                  Cancel
                </QuietButton>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  No message leaves the app from here.
                </span>
              </>
            }
          >
            <PreviewSection title="Drafts" hint="Tick the ones to queue">
              <div className="space-y-2">
                {data.drafts.map((draft, index) => (
                  <CheckRow
                    key={`${draft.label ?? draft.subject ?? index}`}
                    checked={picked.has(index)}
                    onChange={() => toggle(index)}
                    label={draft.label ?? draft.subject ?? `${draft.channel} draft`}
                    meta={`${draft.channel === "EMAIL" ? "Email" : "Slack"}${draft.subject ? ` · ${draft.subject}` : ""}`}
                  >
                    <span className="mt-2 block whitespace-pre-wrap rounded border border-zinc-200 bg-zinc-50 p-3 text-xs leading-relaxed text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                      {draft.body}
                    </span>
                  </CheckRow>
                ))}
              </div>
            </PreviewSection>
          </PreviewShell>
        ) : null}
      </div>
    </Card>
  );
}
