"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ApplicationSummary } from "@/types";
import {
  DEFAULT_APPLICATION_STAGES,
  formatRelativeDate,
  getApplicationStageLabel,
  getInterviewRoundIndexFromStatus,
  normalizeApplicationStatus,
  normalizeInterviewRounds,
  REJECTED_WITHDRAWN_STAGE,
  toneFromStatus,
} from "@/lib/utils";
import { InterviewRoundsModal } from "@/components/applications/interview-rounds-modal";

type BoardApplication = ApplicationSummary & {
  notes?: Array<{
    id: string;
    stage: string | null;
  }>;
};

const ACTIVE_TILE_MIN_HEIGHT_CLASS = "min-h-[144px]";
const FOOTER_PANEL_MIN_HEIGHT_CLASS = "min-h-[68px]";

function getVisibleNoteCount(application: BoardApplication) {
  if (!application.notes) {
    return application._count.notes;
  }

  return application.notes.filter((note) => note.stage !== null).length;
}

function getStageFocusCopy(status: string) {
  const normalizedStatus = normalizeApplicationStatus(status);

  if (normalizedStatus === "Applied") {
    return {
      label: "Next focus",
      text: "Track response timing and keep a follow-up ready.",
    };
  }

  if (normalizedStatus === "Screening") {
    return {
      label: "Next focus",
      text: "Capture recruiter signals and prep your core story.",
    };
  }

  if (normalizedStatus === "Interview") {
    return {
      label: "Next focus",
      text: "Add rounds, track feedback, and keep prep sharp.",
    };
  }

  if (normalizedStatus === REJECTED_WITHDRAWN_STAGE) {
    return {
      label: "Takeaway",
      text: "Archive the outcome and keep any lessons worth repeating.",
    };
  }

  if (normalizedStatus === "Accepted") {
    return {
      label: "Next focus",
      text: "Capture final details like start date and offer context.",
    };
  }

  return {
    label: "Next focus",
    text: "Open the application to keep the timeline current.",
  };
}

function renderCurrentStageIcon(status: string, rounds: string[]) {
  const normalizedStatus = normalizeApplicationStatus(status);

  if (normalizedStatus === "Interview") {
    if (rounds.length > 1) {
      return null;
    }

    return (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-4 w-4 text-amber-700/80"
      >
        <path
          d="M10 8.2a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.6 15.7c.35-2.55 2.32-4 5.4-4 3.06 0 5.03 1.45 5.4 4"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (normalizedStatus === "Applied") {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-4 w-4 text-stone-500/70"
      >
        <path
          d="M5.75 4.25h8.5A1.5 1.5 0 0 1 15.75 5.75v8.5a1.5 1.5 0 0 1-1.5 1.5h-8.5a1.5 1.5 0 0 1-1.5-1.5v-8.5a1.5 1.5 0 0 1 1.5-1.5Z"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M7.5 7.25h5M7.5 9.75h5M7.5 12.25h3"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (normalizedStatus === "Screening") {
    return (
      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-sky-700/80">
        <path
          d="M4.75 13.5 8.125 10.125 10.25 12.25l5-5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.75 7.25h3.5v3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (normalizedStatus === REJECTED_WITHDRAWN_STAGE) {
    return (
      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-rose-700/80">
        <path
          d="M6.5 6.5 13.5 13.5M13.5 6.5l-7 7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle
          cx="10"
          cy="10"
          r="6.75"
          stroke="currentColor"
          strokeWidth="1.3"
        />
      </svg>
    );
  }

  if (normalizedStatus === "Accepted") {
    return <span className="text-base leading-none">🎉</span>;
  }

  return null;
}

export function PipelineBoard({
  applications,
}: {
  applications: BoardApplication[];
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

  function handleTileDragStart(
    event: React.DragEvent<HTMLButtonElement>,
    applicationId: string,
  ) {
    dragGestureRef.current = true;
    setDraggedApplicationId(applicationId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", applicationId);
  }

  function handleTileDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function openTile(application: BoardApplication) {
    if (dragGestureRef.current) {
      dragGestureRef.current = false;
      return;
    }

    if (normalizeApplicationStatus(application.status) === "Interview") {
      setSelectedInterviewApplicationId(application.id);
      return;
    }

    router.push(`/applications/${application.id}`);
  }

  function renderInterviewProgress(
    status: string,
    rounds: string[],
    className = "mt-2",
  ) {
    const roundCount = rounds.length;

    if (roundCount <= 1) {
      return renderStageFocus("Interview", className);
    }

    const currentRoundNumber =
      getInterviewRoundIndexFromStatus(status, roundCount) + 1;
    const progress = `${(currentRoundNumber / roundCount) * 100}%`;

    return (
      <div
        className={`${className} ${FOOTER_PANEL_MIN_HEIGHT_CLASS} rounded-2xl border border-white/45 bg-white/45 px-2.5 py-2`}
      >
        <div className="flex items-center justify-between gap-3 text-[10px] font-medium uppercase tracking-[0.16em] text-stone-700/80">
          <span>Interview progress</span>
          <span>
            {currentRoundNumber}/{roundCount}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/60">
          <div
            className="h-full rounded-full bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 transition-[width] duration-300"
            style={{ width: progress }}
          />
        </div>
      </div>
    );
  }

  function renderStageFocus(status: string, className = "mt-2") {
    const stageFocus = getStageFocusCopy(status);

    return (
      <div
        className={`${className} flex ${FOOTER_PANEL_MIN_HEIGHT_CLASS} flex-col justify-between rounded-2xl border border-white/45 bg-white/45 px-2.5 py-2`}
      >
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-stone-700/80">
          {stageFocus.label}
        </p>
        <p className="mt-1 text-[11px] leading-4 text-stone-700/90">
          {stageFocus.text}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-[1.9rem] border border-white/70 bg-white/80 p-3 shadow-[0_24px_60px_rgba(87,83,78,0.1)] backdrop-blur lg:overflow-x-visible">
        <div className="min-w-[1060px] space-y-2 lg:min-w-0">
          <div
            className="grid gap-2 px-1"
            style={{
              gridTemplateColumns: `220px repeat(${DEFAULT_APPLICATION_STAGES.length}, minmax(120px, 1fr))`,
            }}
          >
            <div className="px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-400">
              Application
            </div>
            {DEFAULT_APPLICATION_STAGES.map((stage) => (
              <div
                key={stage.id}
                className="rounded-2xl bg-stone-100/80 px-2.5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500"
              >
                {stage.id === REJECTED_WITHDRAWN_STAGE ? (
                  <span className="flex flex-col leading-tight">
                    <span>Rejected</span>
                    <span>/ Withdrawn</span>
                  </span>
                ) : (
                  stage.label
                )}
              </div>
            ))}
          </div>

          {applications.map((application) => (
            <div
              key={application.id}
              className="grid gap-2"
              style={{
                gridTemplateColumns: `220px repeat(${DEFAULT_APPLICATION_STAGES.length}, minmax(120px, 1fr))`,
              }}
            >
              <button
                type="button"
                onClick={() => router.push(`/applications/${application.id}`)}
                className="rounded-[1.35rem] border border-stone-200 bg-stone-50/80 px-3 py-2 text-left transition hover:bg-stone-100"
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
                const isCurrent =
                  normalizeApplicationStatus(application.status) === stage.id;
                const visibleNoteCount = getVisibleNoteCount(application);
                const hasVisibleNotes = visibleNoteCount > 0;
                const footerSpacingClass = hasVisibleNotes ? "mt-auto" : "mt-5";
                const interviewRounds = Array.isArray(
                  application.interviewRounds,
                )
                  ? application.interviewRounds
                  : [];

                return (
                  <div
                    key={`${application.id}-${stage.id}`}
                    onDragOver={handleTileDragOver}
                    onDrop={() => {
                      setDraggedApplicationId(null);
                      moveApplication(application.id, stage.id);
                    }}
                    className={`${ACTIVE_TILE_MIN_HEIGHT_CLASS} rounded-[1.35rem] border p-1.5 transition ${
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
                        onDragStart={(event) =>
                          handleTileDragStart(event, application.id)
                        }
                        onDragEnd={() => setDraggedApplicationId(null)}
                        className={`flex h-full ${ACTIVE_TILE_MIN_HEIGHT_CLASS} w-full cursor-pointer flex-col rounded-2xl px-2.5 py-2 text-left ${toneFromStatus(application.status)}`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                              {getApplicationStageLabel(
                                application.status,
                                interviewRounds,
                              )}
                            </p>
                            {renderCurrentStageIcon(
                              application.status,
                              normalizeInterviewRounds(interviewRounds),
                            )}
                          </div>
                          {hasVisibleNotes ? (
                            <p className="mt-1.5 text-xs font-medium">
                              {visibleNoteCount}{" "}
                              {visibleNoteCount === 1
                                ? "note attached"
                                : "notes attached"}
                            </p>
                          ) : null}
                        </div>
                        {normalizeApplicationStatus(application.status) ===
                        "Interview"
                          ? renderInterviewProgress(
                              application.status,
                              normalizeInterviewRounds(interviewRounds),
                              footerSpacingClass,
                            )
                          : renderStageFocus(
                              application.status,
                              footerSpacingClass,
                            )}
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
