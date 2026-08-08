"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ApplyButton,
  AssistHeader,
  BulletList,
  CheckRow,
  ErrorBanner,
  GenerateButton,
  PreviewSection,
  PreviewShell,
  QuietButton,
} from "@/components/assist/ui";
import { ResultBanner } from "@/components/assist/ui";
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
          accent="blue"
          role="ops"
          title="Ops Assist"
          helper="Checks this event against a standard club checklist and shows what is missing."
          badge="Deterministic · no API key"
        />

        <GenerateButton onClick={handleGenerate} loading={phase === "loading"} loadingLabel="Checking…">
          🔎 Suggest tasks
        </GenerateButton>

        {phase === "error" && error ? <ErrorBanner message={error} /> : null}
        {phase === "done" && result ? <ResultBanner message={result} onDone={dismiss} /> : null}

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
