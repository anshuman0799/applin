"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ApplicationWithNotes } from "@/types";
import {
  collapseInterviewRoundsAfterDelete,
  DEFAULT_APPLICATION_STAGES,
  expandInterviewRounds,
  formatDate,
  getInterviewRoundIndexFromStatus,
  isInterviewStatus,
  normalizeApplicationStatus,
  normalizeInterviewRounds,
  REJECTED_WITHDRAWN_STAGE,
} from "@/lib/utils";

const MAX_INTERVIEW_ROUNDS = 6;

function getInterviewStageKey(index: number) {
  return `Interview:${index + 1}`;
}

function getStageBase(stageKey: string) {
  if (stageKey === "Rejected" || stageKey === "Withdrawn") {
    return REJECTED_WITHDRAWN_STAGE;
  }

  return stageKey.startsWith("Interview:") ? "Interview" : stageKey;
}

function matchesStageKey(
  noteStage: string | null | undefined,
  stageKey: string,
) {
  if (
    stageKey === REJECTED_WITHDRAWN_STAGE &&
    (noteStage === "Rejected" || noteStage === "Withdrawn")
  ) {
    return true;
  }

  if (noteStage === stageKey) {
    return true;
  }

  if (stageKey === "Interview:1" && noteStage === "Interview") {
    return true;
  }

  return false;
}

function getStageNotesTitle(stageKey: string) {
  if (!stageKey.startsWith("Interview:")) {
    return `${stageKey} notes`;
  }

  const round = Number(stageKey.split(":")[1] ?? "1");
  return `Interview Round ${round} notes`;
}

function renderStageLabel(label: string) {
  if (label !== REJECTED_WITHDRAWN_STAGE) {
    return label;
  }

  return (
    <>
      <span>Rejected</span>
      <span>/ Withdrawn</span>
    </>
  );
}

export function ApplicationStageEditor({
  application,
}: {
  application: ApplicationWithNotes;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isNotesPending, startNotesTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");
  const interviewRounds = normalizeInterviewRounds(application.interviewRounds);
  const initialInterviewRoundIndex = getInterviewRoundIndexFromStatus(
    application.status,
    interviewRounds.length,
  );
  const [draftInterviewRounds, setDraftInterviewRounds] =
    useState(interviewRounds);
  const [selectedInterviewRoundIndex, setSelectedInterviewRoundIndex] =
    useState(initialInterviewRoundIndex);
  const [selectedStageKey, setSelectedStageKey] = useState(
    isInterviewStatus(application.status)
      ? getInterviewStageKey(initialInterviewRoundIndex)
      : normalizeApplicationStatus(application.status),
  );
  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(false);

  const leadingStages = DEFAULT_APPLICATION_STAGES.filter(
    (stage) => stage.id === "Applied" || stage.id === "Screening",
  );
  const trailingStages = DEFAULT_APPLICATION_STAGES.filter(
    (stage) => stage.id === REJECTED_WITHDRAWN_STAGE || stage.id === "Accepted",
  );

  const tileRadiusClass = "rounded-3xl";
  const tilePaddingClass = "px-4 py-4";
  const titleClass = "text-xs";

  const selectedStageBase = getStageBase(selectedStageKey);
  const selectedStageDefinition =
    DEFAULT_APPLICATION_STAGES.find(
      (stage) => stage.id === selectedStageBase,
    ) ?? DEFAULT_APPLICATION_STAGES[0];
  const selectedStageNotesTitle = getStageNotesTitle(selectedStageKey);
  const currentStageKey = isInterviewStatus(application.status)
    ? getInterviewStageKey(
        getInterviewRoundIndexFromStatus(
          application.status,
          draftInterviewRounds.length,
        ),
      )
    : normalizeApplicationStatus(application.status);
  const currentStageOptions = [
    "Applied",
    "Screening",
    ...draftInterviewRounds.map((_, index) => getInterviewStageKey(index)),
    REJECTED_WITHDRAWN_STAGE,
    "Accepted",
  ];

  const selectedStageNotes = useMemo(
    () =>
      application.notes.filter((note) =>
        matchesStageKey(note.stage, selectedStageKey),
      ),
    [application.notes, selectedStageKey],
  );

  const stageNoteCounts = useMemo(() => {
    const counts = new Map<string, number>();

    function bump(stageKey: string) {
      counts.set(stageKey, (counts.get(stageKey) ?? 0) + 1);
    }

    for (const note of application.notes) {
      if (!note.stage) {
        continue;
      }

      if (note.stage === "Rejected" || note.stage === "Withdrawn") {
        bump(REJECTED_WITHDRAWN_STAGE);
        continue;
      }

      if (note.stage === "Interview") {
        bump("Interview:1");
        continue;
      }

      bump(note.stage);
    }

    return counts;
  }, [application.notes]);

  useEffect(() => {
    const nextInterviewRounds = normalizeInterviewRounds(
      application.interviewRounds,
    );

    setDraftInterviewRounds((currentInterviewRounds) => {
      if (
        currentInterviewRounds.length === nextInterviewRounds.length &&
        currentInterviewRounds.every(
          (round, index) => round === nextInterviewRounds[index],
        )
      ) {
        return currentInterviewRounds;
      }

      return nextInterviewRounds;
    });
  }, [application.interviewRounds]);

  useEffect(() => {
    setSelectedInterviewRoundIndex((currentIndex) => {
      if (draftInterviewRounds.length === 0) {
        return 0;
      }

      if (currentIndex < draftInterviewRounds.length) {
        return currentIndex;
      }

      return draftInterviewRounds.length - 1;
    });
  }, [draftInterviewRounds.length]);

  useEffect(() => {
    const nextInterviewRounds = normalizeInterviewRounds(
      application.interviewRounds,
    );
    const nextInterviewRoundIndex = getInterviewRoundIndexFromStatus(
      application.status,
      nextInterviewRounds.length,
    );

    setSelectedInterviewRoundIndex(nextInterviewRoundIndex);
    setSelectedStageKey(
      isInterviewStatus(application.status)
        ? getInterviewStageKey(nextInterviewRoundIndex)
        : normalizeApplicationStatus(application.status),
    );
    setIsNotesPanelOpen(false);
  }, [application.id, application.interviewRounds, application.status]);

  useEffect(() => {
    if (!selectedStageKey.startsWith("Interview:")) {
      return;
    }

    setSelectedStageKey(getInterviewStageKey(selectedInterviewRoundIndex));
  }, [selectedInterviewRoundIndex]);

  function getTileTone(status: string, isCurrent: boolean) {
    if (!isCurrent) {
      if (status === "Accepted") {
        return "border-emerald-100 bg-emerald-50/70 text-emerald-900 hover:bg-emerald-100/80";
      }

      if (
        status === REJECTED_WITHDRAWN_STAGE ||
        status === "Rejected" ||
        status === "Withdrawn"
      ) {
        return "border-rose-100 bg-rose-50/70 text-rose-900 hover:bg-rose-100/80";
      }

      if (status === "Screening") {
        return "border-sky-100 bg-sky-50/75 text-sky-900 hover:bg-sky-100/80";
      }

      if (status === "Interview") {
        return "border-amber-100 bg-amber-50/75 text-amber-900 hover:bg-amber-100/80";
      }

      return "border-stone-200 bg-stone-50/90 text-stone-700 hover:bg-white";
    }

    if (status === "Accepted") {
      return "border-emerald-200 bg-emerald-100 text-emerald-950 shadow-[0_14px_30px_rgba(16,185,129,0.12)]";
    }

    if (
      status === REJECTED_WITHDRAWN_STAGE ||
      status === "Rejected" ||
      status === "Withdrawn"
    ) {
      return "border-rose-200 bg-rose-100 text-rose-950 shadow-[0_14px_30px_rgba(244,63,94,0.10)]";
    }

    if (status === "Screening") {
      return "border-sky-200 bg-sky-100 text-sky-950 shadow-[0_14px_30px_rgba(14,165,233,0.10)]";
    }

    if (status === "Interview") {
      return "border-amber-300 bg-amber-100 text-amber-950 shadow-[0_14px_30px_rgba(245,158,11,0.14)]";
    }

    return "border-stone-300 bg-stone-200 text-stone-950 shadow-[0_14px_30px_rgba(120,113,108,0.10)]";
  }

  function getTileTextTone(status: string, isCurrent: boolean) {
    if (!isCurrent) {
      return {
        label:
          status === "Accepted"
            ? "text-emerald-700/80"
            : status === REJECTED_WITHDRAWN_STAGE ||
                status === "Rejected" ||
                status === "Withdrawn"
              ? "text-rose-700/80"
              : status === "Screening"
                ? "text-sky-700/80"
                : status === "Interview"
                  ? "text-amber-700/80"
                  : "text-stone-400",
      };
    }

    if (status === "Accepted") {
      return { label: "text-emerald-800/80" };
    }

    if (
      status === REJECTED_WITHDRAWN_STAGE ||
      status === "Rejected" ||
      status === "Withdrawn"
    ) {
      return { label: "text-rose-800/80" };
    }

    if (status === "Screening") {
      return { label: "text-sky-800/80" };
    }

    if (status === "Interview") {
      return { label: "text-amber-800/80" };
    }

    return { label: "text-stone-700/80" };
  }

  function patchApplication(payload: {
    status?: string;
    interviewRounds?: string[];
  }) {
    setError(null);

    startTransition(async () => {
      const response = await fetch(`/api/applications/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setError(data?.error ?? "Could not update the application stage.");
        return;
      }

      router.refresh();
    });
  }

  function viewStage(status: string) {
    if (selectedStageKey === status && isNotesPanelOpen) {
      setIsNotesPanelOpen(false);
      return;
    }

    setSelectedStageKey(status);
    setIsNotesPanelOpen(true);
  }

  function viewInterviewRound(index: number) {
    const stageKey = getInterviewStageKey(index);

    if (selectedStageKey === stageKey && isNotesPanelOpen) {
      setSelectedInterviewRoundIndex(index);
      setIsNotesPanelOpen(false);
      return;
    }

    setSelectedInterviewRoundIndex(index);
    setSelectedStageKey(stageKey);
    setIsNotesPanelOpen(true);
  }

  function updateCurrentStage(stageKey: string) {
    const nextStatus = stageKey.startsWith("Interview:")
      ? stageKey
      : getStageBase(stageKey);

    if (nextStatus.startsWith("Interview:")) {
      const nextInterviewRoundIndex = Number(stageKey.split(":")[1] ?? "1") - 1;
      setSelectedInterviewRoundIndex(
        Math.max(
          0,
          Math.min(nextInterviewRoundIndex, draftInterviewRounds.length - 1),
        ),
      );
    }

    if (nextStatus === currentStageKey) {
      return;
    }

    patchApplication({
      status: nextStatus,
      interviewRounds: draftInterviewRounds,
    });
  }

  function addInterviewRound() {
    if (draftInterviewRounds.length >= MAX_INTERVIEW_ROUNDS) {
      return;
    }

    const expandedRounds = expandInterviewRounds(draftInterviewRounds);
    setDraftInterviewRounds(expandedRounds);
    setSelectedInterviewRoundIndex(expandedRounds.length - 1);
    setSelectedStageKey(getInterviewStageKey(expandedRounds.length - 1));
    patchApplication({ interviewRounds: expandedRounds });
  }

  function deleteInterviewRound(indexToDelete: number) {
    const nextRounds = draftInterviewRounds.filter(
      (_, index) => index !== indexToDelete,
    );
    const collapsedRounds = collapseInterviewRoundsAfterDelete(nextRounds);
    const nextSelectedIndex = Math.min(
      indexToDelete,
      collapsedRounds.length - 1,
    );

    setDraftInterviewRounds(collapsedRounds);
    setSelectedInterviewRoundIndex(nextSelectedIndex);
    setSelectedStageKey(getInterviewStageKey(nextSelectedIndex));
    patchApplication({ interviewRounds: collapsedRounds });
  }

  function startEditingNote(noteId: string, content: string) {
    setNoteError(null);
    setEditingNoteId(noteId);
    setEditingNoteContent(content);
  }

  function cancelEditingNote() {
    setEditingNoteId(null);
    setEditingNoteContent("");
    setNoteError(null);
  }

  const canAddInterviewRound =
    draftInterviewRounds.length < MAX_INTERVIEW_ROUNDS;
  const shouldShowNotesPanel = isNotesPanelOpen;
  const stageHeading = selectedStageNotesTitle.replace(/ notes$/, "");

  function getViewedStageClass(status: string, isViewed: boolean) {
    if (!isViewed) {
      return "";
    }

    return "ring-2 ring-stone-300/80 ring-offset-2 ring-offset-stone-50";
  }

  function getCurrentStageClass(status: string, isCurrent: boolean) {
    if (!isCurrent) {
      return "";
    }

    if (status === "Accepted") {
      return "border-2 border-emerald-600";
    }

    if (
      status === REJECTED_WITHDRAWN_STAGE ||
      status === "Rejected" ||
      status === "Withdrawn"
    ) {
      return "border-2 border-rose-600";
    }

    if (status === "Screening") {
      return "border-2 border-sky-600";
    }

    if (status === "Interview") {
      return "border-2 border-amber-600";
    }

    return "border-2 border-stone-700";
  }

  function getStageNoteCount(stageKey: string) {
    return stageNoteCounts.get(stageKey) ?? 0;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.22em] text-stone-400">
            Pipeline
          </p>
          <p className="text-sm text-stone-500">
            Click any stage to open or close its notes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-600">
            <span className="uppercase tracking-[0.18em] text-stone-400">
              Current stage
            </span>
            <select
              value={currentStageKey}
              onChange={(event) => updateCurrentStage(event.target.value)}
              className="bg-transparent text-sm font-medium text-stone-900 outline-none"
            >
              {currentStageOptions.map((stageKey) => (
                <option key={stageKey} value={stageKey}>
                  {stageKey.startsWith("Interview:")
                    ? `Interview Round ${stageKey.split(":")[1]}`
                    : stageKey}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-stone-200/80 bg-stone-50/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
        <div className="flex flex-wrap items-stretch gap-3">
          {leadingStages.map((stage) => {
            const isCurrent =
              normalizeApplicationStatus(application.status) === stage.id;
            const isSelected = selectedStageKey === stage.id;
            const textTone = getTileTextTone(stage.id, isCurrent);
            const noteCount = getStageNoteCount(stage.id);

            return (
              <div
                key={stage.id}
                className="relative min-w-[150px] flex-1 basis-[150px]"
              >
                <button
                  type="button"
                  onClick={() => viewStage(stage.id)}
                  className={`${tileRadiusClass} ${tilePaddingClass} flex h-full min-h-[140px] w-full min-w-0 flex-col justify-between border text-left transition ${getTileTone(stage.id, isCurrent)} ${getCurrentStageClass(stage.id, isCurrent)} ${getViewedStageClass(stage.id, isSelected)}`}
                >
                  <p
                    className={`${titleClass} flex flex-col items-start uppercase tracking-[0.18em] ${textTone.label}`}
                  >
                    {renderStageLabel(stage.label)}
                  </p>
                  <p className="text-[11px] font-medium text-stone-500">
                    {noteCount} note{noteCount === 1 ? "" : "s"}
                  </p>
                </button>
              </div>
            );
          })}

          {draftInterviewRounds.map((_, index) => {
            const stageKey = getInterviewStageKey(index);
            const isCurrentRound = currentStageKey === stageKey;
            const interviewTextTone = getTileTextTone(
              "Interview",
              isCurrentRound,
            );
            const hasMultipleRounds = draftInterviewRounds.length > 1;
            const isViewed = selectedStageKey === stageKey;
            const noteCount = getStageNoteCount(stageKey);

            return (
              <div
                key={stageKey}
                className="group/round relative min-w-[150px] flex-1 basis-[150px]"
              >
                <button
                  type="button"
                  onClick={() => viewInterviewRound(index)}
                  className={`${tileRadiusClass} ${tilePaddingClass} flex h-full min-h-[140px] w-full min-w-0 flex-col justify-between border text-left transition ${
                    isCurrentRound
                      ? getTileTone("Interview", true)
                      : "border-amber-200 bg-amber-50/85 text-amber-950 hover:bg-amber-100/80"
                  } ${getCurrentStageClass("Interview", isCurrentRound)} ${getViewedStageClass("Interview", isViewed)}`}
                >
                  <div>
                    <p
                      className={`${titleClass} uppercase tracking-[0.18em] ${interviewTextTone.label}`}
                    >
                      Interview
                    </p>
                    {hasMultipleRounds ? (
                      <p className="mt-2 text-[11px] font-semibold tracking-[0.04em] text-amber-800/80">
                        Round {index + 1}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-[11px] font-medium text-stone-500">
                    {noteCount} note{noteCount === 1 ? "" : "s"}
                  </p>
                </button>

                {draftInterviewRounds.length > 1 ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteInterviewRound(index);
                    }}
                    className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full border border-amber-300 bg-white/95 text-[11px] font-semibold text-amber-900 shadow-sm opacity-0 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 group-hover/round:opacity-100 focus:opacity-100"
                    aria-label={`Delete interview round ${index + 1}`}
                  >
                    x
                  </button>
                ) : null}

                {index === draftInterviewRounds.length - 1 &&
                canAddInterviewRound ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      addInterviewRound();
                    }}
                    className="absolute -right-4 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-amber-300 bg-white text-sm font-semibold text-amber-900 shadow-sm opacity-0 transition hover:bg-amber-50 group-hover/round:opacity-100 focus:opacity-100"
                    aria-label="Add another interview round"
                  >
                    +
                  </button>
                ) : null}
              </div>
            );
          })}

          {trailingStages.map((stage) => {
            const isCurrent =
              normalizeApplicationStatus(application.status) === stage.id;
            const isSelected = selectedStageKey === stage.id;
            const textTone = getTileTextTone(stage.id, isCurrent);
            const noteCount = getStageNoteCount(stage.id);

            return (
              <div
                key={stage.id}
                className="relative min-w-[150px] flex-1 basis-[150px]"
              >
                <button
                  type="button"
                  onClick={() => viewStage(stage.id)}
                  className={`${tileRadiusClass} ${tilePaddingClass} flex h-full min-h-[140px] w-full min-w-0 flex-col justify-between border text-left transition ${getTileTone(stage.id, isCurrent)} ${getCurrentStageClass(stage.id, isCurrent)} ${getViewedStageClass(stage.id, isSelected)}`}
                >
                  <p
                    className={`${titleClass} flex flex-col items-start uppercase tracking-[0.18em] ${textTone.label}`}
                  >
                    {renderStageLabel(stage.label)}
                  </p>
                  <p className="text-[11px] font-medium text-stone-500">
                    {noteCount} note{noteCount === 1 ? "" : "s"}
                  </p>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {shouldShowNotesPanel ? (
        <section className="rounded-[1.75rem] border border-stone-200/80 bg-white/90 p-5 shadow-[0_20px_50px_rgba(87,83,78,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-400">
                Stage notes
              </p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight text-stone-950">
                {selectedStageNotesTitle}
              </h3>
              <p className="mt-1 text-sm text-stone-500">
                {selectedStageDefinition.description}
              </p>
            </div>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
              {selectedStageNotes.length} note
              {selectedStageNotes.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="mt-5 space-y-4">
            <div className="space-y-3">
              {selectedStageNotes.map((note) => (
                <article
                  key={note.id}
                  className="group/note rounded-3xl border border-stone-200/80 bg-stone-50/65 p-3"
                >
                  {editingNoteId === note.id ? (
                    <form
                      className="space-y-3"
                      onSubmit={(event) => {
                        event.preventDefault();
                        setNoteError(null);

                        startNotesTransition(async () => {
                          const response = await fetch(
                            `/api/applications/${application.id}/notes/${note.id}`,
                            {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                content: editingNoteContent.trim(),
                                stage: selectedStageKey,
                              }),
                            },
                          );
                          const data = (await response
                            .json()
                            .catch(() => null)) as {
                            error?: string;
                          } | null;

                          if (!response.ok) {
                            setNoteError(
                              data?.error ?? "Could not update stage note.",
                            );
                            return;
                          }

                          cancelEditingNote();
                          router.refresh();
                        });
                      }}
                    >
                      <textarea
                        value={editingNoteContent}
                        onChange={(event) =>
                          setEditingNoteContent(event.target.value)
                        }
                        rows={3}
                        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-2 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                      />
                      {noteError ? (
                        <p className="text-sm text-rose-600">{noteError}</p>
                      ) : null}
                      <div className="flex items-center gap-3">
                        <button
                          type="submit"
                          disabled={
                            isNotesPending ||
                            editingNoteContent.trim().length === 0
                          }
                          className="rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isNotesPending ? "Saving..." : "Save note"}
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
                          onClick={cancelEditingNote}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-sm leading-7 text-stone-700">
                      {note.content}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-xs text-stone-400">
                      Updated {formatDate(note.updatedAt)}
                    </p>
                    <div className="flex items-center gap-2 opacity-0 transition group-hover/note:opacity-100 focus-within:opacity-100">
                      <button
                        type="button"
                        className="grid h-7 w-7 place-items-center rounded-full border border-stone-200 bg-white text-stone-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                        aria-label="Edit note"
                        onClick={() => startEditingNote(note.id, note.content)}
                      >
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          className="h-4 w-4"
                        >
                          <path
                            d="M10.833 4.167 15.833 9.167M4.167 15.833l3.043-.608a2.5 2.5 0 0 0 1.276-.684l7.054-7.053a1.768 1.768 0 1 0-2.5-2.5L5.986 12.04a2.5 2.5 0 0 0-.684 1.277l-.608 2.516 2.473-.608Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="grid h-7 w-7 place-items-center rounded-full border border-stone-200 bg-white text-stone-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                        aria-label="Delete note"
                        onClick={() => {
                          setNoteError(null);
                          const confirmed = window.confirm(
                            "Delete this stage note?",
                          );

                          if (!confirmed) {
                            return;
                          }

                          startNotesTransition(async () => {
                            const response = await fetch(
                              `/api/applications/${application.id}/notes/${note.id}`,
                              {
                                method: "DELETE",
                              },
                            );

                            if (!response.ok) {
                              setNoteError("Could not delete stage note.");
                              return;
                            }

                            if (editingNoteId === note.id) {
                              cancelEditingNote();
                            }

                            router.refresh();
                          });
                        }}
                      >
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          className="h-4 w-4"
                        >
                          <path
                            d="M5.833 6.667h8.334M8.333 3.333h3.334M7.5 8.333v5M12.5 8.333v5M4.167 6.667l.833 9.166c.08.885.822 1.56 1.71 1.56h6.58c.888 0 1.63-.675 1.71-1.56l.833-9.166"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <form
              className="space-y-3 rounded-3xl border border-stone-200 bg-stone-50/80 p-4"
              onSubmit={(event) => {
                event.preventDefault();
                setNoteError(null);
                const form = event.currentTarget;
                const formData = new FormData(form);
                const payload = {
                  content: String(formData.get("content") ?? "").trim(),
                  stage: selectedStageKey,
                };

                startNotesTransition(async () => {
                  const response = await fetch(
                    `/api/applications/${application.id}/notes`,
                    {
                      headers: { "Content-Type": "application/json" },
                      method: "POST",
                      body: JSON.stringify(payload),
                    },
                  );
                  const data = (await response.json().catch(() => null)) as {
                    error?: string;
                  } | null;

                  if (!response.ok) {
                    setNoteError(data?.error ?? "Could not add stage note.");
                    return;
                  }

                  form.reset();
                  setIsNotesPanelOpen(true);
                  router.refresh();
                });
              }}
            >
              <textarea
                name="content"
                required
                rows={3}
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-2 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                placeholder={`Add a note for ${stageHeading.toLowerCase()} stage`}
              />
              {noteError ? (
                <p className="text-sm text-rose-600">{noteError}</p>
              ) : null}
              <button
                type="submit"
                disabled={isNotesPending}
                className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isNotesPending ? "Saving note..." : "Add note"}
              </button>
            </form>
          </div>
        </section>
      ) : null}

      {isPending ? (
        <p className="text-sm text-stone-500">Updating stage...</p>
      ) : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
