"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ApplicationSummary } from "@/types";
import {
  DEFAULT_APPLICATION_STAGES,
  formatRelativeDate,
  getApplicationStageLabel,
  normalizeInterviewRounds,
  toneFromStatus,
} from "@/lib/utils";
import { InterviewRoundsModal } from "@/components/applications/interview-rounds-modal";

export function PipelineBoard({
  applications,
}: {
  applications: ApplicationSummary[];
}) {
  const router = useRouter();
  const [draggedApplicationId, setDraggedApplicationId] = useState<
    string | null
  >(null);
  const [selectedInterviewApplicationId, setSelectedInterviewApplicationId] =
    useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const dragGestureRef = useRef(false);

  const selectedInterviewApplication = applications.find(
    (application) => application.id === selectedInterviewApplicationId,
  );

  function moveApplication(applicationId: string, status: string) {
    setError(null);

    startTransition(async () => {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => ({ error: "Could not update the board stage." }));

        setError(data?.error ?? "Could not update the board stage.");
        return;
      }

      router.refresh();
    });
  }

  function openTile(application: ApplicationSummary) {
    if (dragGestureRef.current) {
      dragGestureRef.current = false;
      return;
    }

    if (application.status === "Interview") {
      setSelectedInterviewApplicationId(application.id);
      return;
    }

    router.push(`/applications/${application.id}`);
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-[1.9rem] border border-white/70 bg-white/80 p-3 shadow-[0_24px_60px_rgba(87,83,78,0.1)] backdrop-blur lg:overflow-x-visible">
        <div className="min-w-[1060px] space-y-2 lg:min-w-0">
          <div className="grid grid-cols-[220px_repeat(6,minmax(120px,1fr))] gap-2 px-1">
            <div className="px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-400">
              Application
            </div>
            {DEFAULT_APPLICATION_STAGES.map((stage) => (
              <div
                key={stage.id}
                className="rounded-2xl bg-stone-100/80 px-2.5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500"
              >
                {stage.label}
              </div>
            ))}
          </div>

          {applications.map((application) => (
            <div
              key={application.id}
              className="grid grid-cols-[220px_repeat(6,minmax(120px,1fr))] gap-2"
            >
              <button
                type="button"
                onClick={() => router.push(`/applications/${application.id}`)}
                className="rounded-[1.35rem] border border-stone-200 bg-stone-50/80 px-3 py-3 text-left transition hover:bg-stone-100"
              >
                <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">
                  {application.company}
                </p>
                <h3 className="mt-1.5 text-sm font-semibold leading-5 text-stone-950">
                  {application.role}
                </h3>
                <p className="mt-1.5 text-xs text-stone-500">
                  {application.location || "Location not set"}
                </p>
                <p className="mt-2 text-[11px] text-stone-400">
                  Updated {formatRelativeDate(application.updatedAt)}
                </p>
              </button>

              {DEFAULT_APPLICATION_STAGES.map((stage) => {
                const isCurrent = application.status === stage.id;
                const interviewRounds = Array.isArray(
                  application.interviewRounds,
                )
                  ? application.interviewRounds
                  : [];

                return (
                  <div
                    key={`${application.id}-${stage.id}`}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => {
                      setDraggedApplicationId(null);
                      moveApplication(application.id, stage.id);
                    }}
                    className={`min-h-[108px] rounded-[1.35rem] border p-2.5 transition ${
                      isCurrent
                        ? "border-stone-200 bg-stone-50/80"
                        : "border-dashed border-stone-200 bg-white/50"
                    } ${draggedApplicationId === application.id ? "ring-2 ring-sky-100" : ""}`}
                  >
                    {isCurrent ? (
                      <button
                        type="button"
                        draggable
                        onClick={() => openTile(application)}
                        onDragStart={() => {
                          dragGestureRef.current = true;
                          setDraggedApplicationId(application.id);
                        }}
                        onDragEnd={() => setDraggedApplicationId(null)}
                        className={`flex h-full w-full flex-col justify-between rounded-2xl px-2.5 py-2.5 text-left ${toneFromStatus(application.status)}`}
                      >
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                            {getApplicationStageLabel(
                              application.status,
                              interviewRounds,
                            )}
                          </p>
                          <p className="mt-1.5 text-xs font-medium">
                            {application._count.notes} notes attached
                          </p>
                        </div>
                        {application.status === "Interview" ? (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {normalizeInterviewRounds(interviewRounds).map(
                              (round) => (
                                <span
                                  key={round}
                                  className="rounded-full bg-white/60 px-1.5 py-0.5 text-[10px] font-medium text-stone-900"
                                >
                                  {round}
                                </span>
                              ),
                            )}
                          </div>
                        ) : null}
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {isPending ? (
        <p className="text-sm text-stone-500">Updating board...</p>
      ) : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {selectedInterviewApplication ? (
        <InterviewRoundsModal
          application={selectedInterviewApplication}
          onClose={() => setSelectedInterviewApplicationId(null)}
        />
      ) : null}
    </div>
  );
}
