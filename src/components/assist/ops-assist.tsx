"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AssistHeader,
  BulletList,
  CheckRow,
  ErrorBanner,
  GenerateButton,
  PreviewSection,
  PreviewShell,
  ResultBanner,
  SecondaryButton,
} from "@/components/assist/ui";
import { useAssist } from "@/components/assist/use-assist";
import { Card } from "@/components/card";
import { applyOps } from "@/lib/actions/assist";
import type { OpsData } from "@/lib/ai/types";

const DEFAULT_INPUT = "Check this event for missing prep tasks and run-of-show gaps";

export function OpsAssist({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { phase, setPhase, response, error, setError, result, setResult, generate, dismiss } =
    useAssist<OpsData>("ops", eventId);

  const [pickedTasks, setPickedTasks] = useState<Set<number>>(new Set());
  const [pickedRos, setPickedRos] = useState<Set<number>>(new Set());

  const data = response?.data;

  async function handleGenerate() {
    setPickedTasks(new Set());
    setPickedRos(new Set());
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
    setPickedTasks(new Set(data.tasks.map((_, i) => i)));
    setPickedRos(new Set(data.runOfShow.map((_, i) => i)));
  }

  const selectedCount = pickedTasks.size + pickedRos.size;

  async function handleApply() {
    if (!data) return;
    setPhase("applying");
    setError(null);
    try {
      const res = await applyOps(eventId, {
        tasks: [...pickedTasks].map((i) => data.tasks[i]),
        runOfShow: [...pickedRos].map((i) => data.runOfShow[i]),
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

  return (
    <Card>
      <div id="ops-assist" className="scroll-mt-24">
        <AssistHeader
          eyebrow="Skill · ops"
          title="Ops Assist"
          subtitle="Finds missing prep tasks and run-of-show gaps before the doors open."
          badge="Deterministic · no API key"
        />

        <div className="flex flex-wrap items-center gap-3">
          <GenerateButton onClick={handleGenerate} loading={phase === "loading"} loadingLabel="Checking…">
            🔎 Check event readiness
          </GenerateButton>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Compares your event against a standard club checklist. You pick what to add.
          </p>
        </div>

        {phase === "error" && error ? <ErrorBanner message={error} /> : null}
        {phase === "done" && result ? <ResultBanner message={result} onDone={dismiss} /> : null}

        {(phase === "preview" || phase === "applying") && data && response ? (
          <PreviewShell
            summary={response.summary}
            footer={
              <>
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={phase === "applying" || selectedCount === 0}
                  className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  {phase === "applying" ? "Saving…" : `Apply selected (${selectedCount})`}
                </button>
                <SecondaryButton onClick={selectAll} disabled={phase === "applying"}>
                  Select all
                </SecondaryButton>
                <SecondaryButton onClick={dismiss} disabled={phase === "applying"}>
                  Dismiss
                </SecondaryButton>
              </>
            }
          >
            {data.risks && data.risks.length > 0 ? (
              <PreviewSection title="Risks spotted">
                <BulletList items={data.risks} />
              </PreviewSection>
            ) : null}

            {data.tasks.length > 0 ? (
              <PreviewSection title="Suggested tasks" hint="Creates Task rows">
                <div className="space-y-2">
                  {data.tasks.map((task, index) => (
                    <CheckRow
                      key={`${task.title}-${index}`}
                      checked={pickedTasks.has(index)}
                      onChange={() => toggle(pickedTasks, index, setPickedTasks)}
                      label={task.title}
                      meta={task.notes}
                    />
                  ))}
                </div>
              </PreviewSection>
            ) : (
              <PreviewSection title="Suggested tasks">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Nothing missing against the standard checklist. Nice.
                </p>
              </PreviewSection>
            )}

            {data.runOfShow.length > 0 ? (
              <PreviewSection title="Suggested run of show" hint="Creates timeline rows">
                <div className="space-y-2">
                  {data.runOfShow.map((item, index) => (
                    <CheckRow
                      key={`${item.time}-${index}`}
                      checked={pickedRos.has(index)}
                      onChange={() => toggle(pickedRos, index, setPickedRos)}
                      label={`${item.time} — ${item.title}`}
                      meta={[item.durationMin ? `${item.durationMin} min` : null, item.notes]
                        .filter(Boolean)
                        .join(" · ")}
                    />
                  ))}
                </div>
              </PreviewSection>
            ) : null}
          </PreviewShell>
        ) : null}
      </div>
    </Card>
  );
}
