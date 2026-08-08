"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ApplyButton,
  BulletList,
  CheckRow,
  ErrorBanner,
  GenerateButton,
  PreviewSection,
  PreviewShell,
  QuietButton,
  ResultBanner,
} from "@/components/assist/ui";
import { useAssist } from "@/components/assist/use-assist";
import { applyAfters } from "@/lib/actions/assist";
import type { MetricsData } from "@/lib/ai/types";

const DEFAULT_INPUT =
  "Generate the full AFTERS package: metrics to log, follow-ups, debrief, survey, and a thank-you draft";

function formatDue(iso?: string): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return undefined;
  return `Due ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

export function AftersAssist({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { phase, setPhase, response, error, setError, result, setResult, generate, dismiss } =
    useAssist<MetricsData>("metrics", eventId);

  const [pickedMetrics, setPickedMetrics] = useState<Set<number>>(new Set());
  const [metricValues, setMetricValues] = useState<Record<number, string>>({});
  const [pickedFollowUps, setPickedFollowUps] = useState<Set<number>>(new Set());
  const [saveThankYou, setSaveThankYou] = useState(true);
  const [saveDebriefNote, setSaveDebriefNote] = useState(false);

  const data = response?.data;

  async function handleGenerate() {
    setPickedMetrics(new Set());
    setMetricValues({});
    setPickedFollowUps(new Set());
    setSaveThankYou(true);
    setSaveDebriefNote(false);
    await generate(DEFAULT_INPUT);
  }

  function toggle(set: Set<number>, index: number, apply: (next: Set<number>) => void) {
    const next = new Set(set);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    apply(next);
  }

  function selectAll() {
    if (!data) return;
    setPickedMetrics(new Set(data.metrics.map((_, i) => i)));
    setPickedFollowUps(new Set(data.followUps.map((_, i) => i)));
    if (data.draftPreview) setSaveThankYou(true);
  }

  const selectedCount =
    pickedMetrics.size +
    pickedFollowUps.size +
    (saveThankYou && data?.draftPreview ? 1 : 0) +
    (saveDebriefNote ? 1 : 0);

  function debriefNoteBody(): string | null {
    if (!data) return null;
    const section = (label: string, items: string[]) =>
      items.length > 0 ? [`${label}:`, ...items.map((i) => `• ${i}`), ""].join("\n") : "";
    const body = [
      section("What went well", data.debrief.wentWell),
      section("What to improve", data.debrief.improve),
      section("Quotes worth keeping", data.debrief.quotes),
      section("Next event ideas", data.debrief.nextEventIdeas),
      data.surveyQuestions && data.surveyQuestions.length > 0
        ? section("Pulse survey", data.surveyQuestions)
        : "",
    ]
      .filter(Boolean)
      .join("\n")
      .trim();
    return body || null;
  }

  async function handleApply() {
    if (!data) return;
    setPhase("applying");
    setError(null);

    const metrics = [...pickedMetrics].map((index) => {
      const metric = data.metrics[index];
      const raw = metricValues[index];
      const parsed = raw !== undefined && raw !== "" ? Number(raw) : NaN;
      return {
        name: metric.name,
        value: Number.isNaN(parsed) ? (metric.value ?? null) : parsed,
        unit: metric.unit,
        notes: metric.notes,
      };
    });

    const followUps = [...pickedFollowUps].map((index) => data.followUps[index]);
    const note = saveDebriefNote ? debriefNoteBody() : null;

    try {
      const res = await applyAfters(eventId, {
        metrics,
        followUps,
        thankYouDraft:
          saveThankYou && data.draftPreview
            ? { ...data.draftPreview, status: "AWAITING_APPROVAL" }
            : null,
        debriefNote: note
          ? { channel: "SLACK", subject: "Debrief notes", body: note, status: "DRAFT" }
          : null,
      });
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

  const busy = phase === "loading";

  return (
    <div className="mt-6 border-t border-zinc-200 pt-5 dark:border-zinc-800">
      <GenerateButton onClick={handleGenerate} loading={busy} loadingLabel="Writing AFTERS…">
        ✨ Generate with AFTERS
      </GenerateButton>

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
                disabled={phase === "applying" || selectedCount === 0}
              >
                {`Apply selected (${selectedCount})`}
              </ApplyButton>
              <QuietButton onClick={selectAll} disabled={phase === "applying"}>
                Select all
              </QuietButton>
              <QuietButton onClick={dismiss} disabled={phase === "applying"}>
                Cancel
              </QuietButton>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Nothing saves until you press Apply.
              </span>
            </>
          }
        >
          {data.insights && data.insights.length > 0 ? (
            <PreviewSection title="Read on the event">
              <BulletList items={data.insights} />
            </PreviewSection>
          ) : null}

          {data.metrics.length > 0 ? (
            <PreviewSection
              title="Metrics to log"
              hint={`${data.metrics.length} suggested · type the real number`}
            >
              <div className="space-y-2">
                {data.metrics.map((metric, index) => (
                  <CheckRow
                    key={`${metric.name}-${index}`}
                    checked={pickedMetrics.has(index)}
                    onChange={() => toggle(pickedMetrics, index, setPickedMetrics)}
                    label={metric.name}
                    meta={metric.notes}
                  >
                    <span className="mt-2 flex items-center gap-2">
                      <input
                        type="number"
                        step="any"
                        inputMode="decimal"
                        aria-label={`Value for ${metric.name}`}
                        placeholder={metric.value != null ? String(metric.value) : "value"}
                        value={metricValues[index] ?? ""}
                        onChange={(e) => {
                          setMetricValues((prev) => ({ ...prev, [index]: e.target.value }));
                          if (e.target.value !== "") {
                            setPickedMetrics((prev) => new Set(prev).add(index));
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-24 rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                      />
                      {metric.unit ? (
                        <span className="text-xs text-zinc-500">{metric.unit}</span>
                      ) : null}
                    </span>
                  </CheckRow>
                ))}
              </div>
            </PreviewSection>
          ) : null}

          {data.followUps.length > 0 ? (
            <PreviewSection
              title="Follow-ups"
              hint={`${data.followUps.length} suggested · +2 days, +1 week, +1 month`}
            >
              <div className="space-y-2">
                {data.followUps.map((followUp, index) => (
                  <CheckRow
                    key={`${followUp.title}-${index}`}
                    checked={pickedFollowUps.has(index)}
                    onChange={() => toggle(pickedFollowUps, index, setPickedFollowUps)}
                    label={followUp.title}
                    meta={[formatDue(followUp.dueAt), followUp.notes].filter(Boolean).join(" · ")}
                  />
                ))}
              </div>
            </PreviewSection>
          ) : null}

          {data.debrief.wentWell.length > 0 || data.debrief.improve.length > 0 ? (
            <PreviewSection title="Debrief">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-1.5 text-xs font-medium text-green-700 dark:text-green-400">
                    Went well
                  </p>
                  <BulletList items={data.debrief.wentWell} />
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                    Improve next time
                  </p>
                  <BulletList items={data.debrief.improve} />
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-medium text-zinc-500">Quotes</p>
                  <BulletList items={data.debrief.quotes} tone="quote" />
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-medium text-zinc-500">Next event ideas</p>
                  <BulletList items={data.debrief.nextEventIdeas} />
                </div>
              </div>
              <div className="mt-3">
                <CheckRow
                  checked={saveDebriefNote}
                  onChange={setSaveDebriefNote}
                  label="Save debrief as an internal note"
                  meta="Stored as a Draft (status: draft) so officers can edit it in Approvals. Not sent."
                />
              </div>
            </PreviewSection>
          ) : null}

          {data.surveyQuestions && data.surveyQuestions.length > 0 ? (
            <PreviewSection
              title="Pulse survey"
              hint={`${data.surveyQuestions?.length ?? 0} questions · paste into your form`}
            >
              <ol className="list-inside list-decimal space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                {data.surveyQuestions.map((question, i) => (
                  <li key={i}>{question}</li>
                ))}
              </ol>
            </PreviewSection>
          ) : null}

          {data.draftPreview ? (
            <PreviewSection title="Thank-you note" hint="Goes to Approvals as a draft">
              <CheckRow
                checked={saveThankYou}
                onChange={setSaveThankYou}
                label={`Create ${data.draftPreview.channel === "EMAIL" ? "email" : "Slack"} draft${data.draftPreview.subject ? `: ${data.draftPreview.subject}` : ""}`}
                meta="Lands in Approvals awaiting approval. The app never sends on its own."
              >
                <span className="mt-2 block whitespace-pre-wrap rounded border border-zinc-200 bg-zinc-50 p-3 text-xs leading-relaxed text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                  {data.draftPreview.body}
                </span>
              </CheckRow>
            </PreviewSection>
          ) : null}
        </PreviewShell>
      ) : null}
    </div>
  );
}
