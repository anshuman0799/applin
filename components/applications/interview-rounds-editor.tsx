"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  collapseInterviewRoundsAfterDelete,
  expandInterviewRounds,
  getInterviewRoundIndexFromStatus,
  isSingleInterviewDefaultRound,
  isSingleVisibleDefaultInterviewRound,
  normalizeInterviewRounds,
  sanitizeInterviewRoundNames,
} from "@/lib/utils";

type Props = {
  applicationId: string;
  rounds: string[];
  status: string;
  compact?: boolean;
  showHeader?: boolean;
};

export function InterviewRoundsEditor({
  applicationId,
  rounds,
  status,
  compact = false,
  showHeader = true,
}: Props) {
  const router = useRouter();
  const safeRounds = Array.isArray(rounds) ? rounds : [];
  const managedRounds = isSingleInterviewDefaultRound(safeRounds)
    ? []
    : normalizeInterviewRounds(safeRounds);
  const [items, setItems] = useState(() => managedRounds);
  const [currentStageIndex, setCurrentStageIndex] = useState(() =>
    getInterviewRoundIndexFromStatus(status, managedRounds.length),
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const showRoundPanel =
    items.length > 0 && !isSingleVisibleDefaultInterviewRound(items);

  useEffect(() => {
    const nextItems = isSingleInterviewDefaultRound(safeRounds)
      ? []
      : normalizeInterviewRounds(safeRounds);
    setItems(nextItems);
    setCurrentStageIndex(
      getInterviewRoundIndexFromStatus(status, nextItems.length),
    );
  }, [rounds, safeRounds, status]);

  function persist(nextRounds: string[], nextStageIndex: number) {
    const sanitizedRounds = sanitizeInterviewRoundNames(nextRounds);
    const clampedStageIndex = Math.max(
      0,
      Math.min(nextStageIndex, sanitizedRounds.length - 1),
    );
    const fallbackItems = isSingleInterviewDefaultRound(safeRounds)
      ? []
      : normalizeInterviewRounds(safeRounds);

    setError(null);
    setItems(sanitizedRounds);
    setCurrentStageIndex(clampedStageIndex);

    startTransition(async () => {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewRounds: sanitizedRounds,
          status: `Interview:${clampedStageIndex + 1}`,
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setError(data?.error ?? "Could not save interview rounds.");
        setItems(fallbackItems);
        setCurrentStageIndex(
          getInterviewRoundIndexFromStatus(status, fallbackItems.length),
        );
        return;
      }

      router.refresh();
    });
  }

  function addRound() {
    if (items.length >= 6) {
      return;
    }

    persist(expandInterviewRounds(items), currentStageIndex);
  }

  function deleteRound(indexToDelete: number) {
    if (items.length <= 1) {
      return;
    }

    const nextRounds = items.filter((_, index) => index !== indexToDelete);
    const collapsedRounds = collapseInterviewRoundsAfterDelete(nextRounds);

    let nextStageIndex = currentStageIndex;

    if (indexToDelete < currentStageIndex) {
      nextStageIndex = currentStageIndex - 1;
    } else if (indexToDelete === currentStageIndex) {
      nextStageIndex = Math.min(currentStageIndex, collapsedRounds.length - 1);
    }

    persist(collapsedRounds, nextStageIndex);
  }

  function selectRound(index: number) {
    if (index === currentStageIndex) {
      return;
    }

    persist(items, index);
  }

  const editor = (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p
            className={
              compact
                ? "text-xs font-medium text-stone-500"
                : "text-sm font-medium text-stone-900"
            }
          >
            Interview rounds
          </p>
          {!compact ? (
            <p className="text-sm text-stone-600">
              Add/Manage Interview rounds
            </p>
          ) : null}
        </div>

        <button
          type="button"
          disabled={isPending || items.length >= 6}
          onClick={addRound}
          className="grid h-9 w-9 place-items-center rounded-full border border-amber-300 bg-white text-base font-semibold text-amber-900 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Add interview round"
        >
          +
        </button>
      </div>

      {showRoundPanel ? (
        <div className="rounded-3xl border border-amber-200/80 bg-amber-50/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-1.5">
              {items.map((round, index) => {
                const isCurrent = index === currentStageIndex;
                const canDelete = items.length > 1;

                return (
                  <div
                    key={round}
                    className="flex min-w-0 items-center gap-1.5"
                  >
                    <div
                      className={`inline-flex min-w-0 flex-1 items-center gap-1 rounded-full border pr-1 transition ${
                        isCurrent
                          ? "border-amber-300 bg-amber-100 text-amber-950 shadow-[0_10px_24px_rgba(245,158,11,0.14)]"
                          : "border-amber-200 bg-white/88 text-amber-900"
                      }`}
                    >
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => selectRound(index)}
                        className="min-w-0 flex-1 truncate rounded-full px-2.5 py-2 text-xs font-medium transition hover:bg-white/40 disabled:cursor-not-allowed disabled:opacity-60"
                        title={round}
                      >
                        {round}
                      </button>
                      {canDelete ? (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => deleteRound(index)}
                          className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/80 text-[10px] font-semibold text-stone-500 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label={`Delete interview round ${index + 1}`}
                        >
                          x
                        </button>
                      ) : null}
                    </div>

                    {index < items.length - 1 ? (
                      <span
                        aria-hidden="true"
                        className="shrink-0 text-xs font-semibold text-amber-500/80"
                      >
                        →
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-amber-900/75">Use + to add rounds.</p>
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="space-y-3">
      {showHeader ? editor : <div>{editor}</div>}

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
