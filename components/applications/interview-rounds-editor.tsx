"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  getCurrentInterviewRound,
  getNextInterviewRoundName,
  normalizeInterviewRounds,
  sanitizeInterviewRoundNames,
} from "@/lib/utils";

type Props = {
  applicationId: string;
  rounds: string[];
  compact?: boolean;
  showHeader?: boolean;
  minimalAddButton?: boolean;
};

export function InterviewRoundsEditor({
  applicationId,
  rounds,
  compact = false,
  showHeader = true,
  minimalAddButton = false,
}: Props) {
  const router = useRouter();
  const safeRounds = Array.isArray(rounds) ? rounds : [];
  const [items, setItems] = useState(() =>
    normalizeInterviewRounds(safeRounds),
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setItems(normalizeInterviewRounds(safeRounds));
  }, [rounds]);

  function persist(nextRounds: string[]) {
    const sanitizedRounds = sanitizeInterviewRoundNames(nextRounds);

    setError(null);
    setItems(sanitizedRounds);

    startTransition(async () => {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewRounds: sanitizedRounds }),
      });

      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setError(data?.error ?? "Could not save interview rounds.");
        setItems(normalizeInterviewRounds(safeRounds));
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {showHeader ? (
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
                Drag to reorder. The right-most round is treated as the current
                one and will show on the board.
              </p>
            ) : null}
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              persist([...items, getNextInterviewRoundName(items)]);
            }}
            className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Add round
          </button>
        </div>
      ) : null}

      <div className="group/interview rounded-3xl border border-amber-200/80 bg-amber-50/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-800/80">
              Interview section
            </p>
            <p className="mt-1 text-xs text-amber-900/80">
              Current round: {getCurrentInterviewRound(items)}
            </p>
          </div>

          {minimalAddButton ? (
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                persist([...items, getNextInterviewRoundName(items)]);
              }}
              className="grid h-9 w-9 place-items-center rounded-full border border-amber-300 bg-white/80 text-base font-semibold text-amber-900 opacity-70 transition hover:bg-white hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50 group-hover/interview:opacity-100"
              aria-label="Add interview round"
            >
              +
            </button>
          ) : null}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {items.map((round, index) => {
            const isCurrent = index === items.length - 1;

            return (
              <div
                key={`${round}-${index}`}
                draggable
                onDragStart={() => setDraggedIndex(index)}
                onDragEnd={() => setDraggedIndex(null)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (draggedIndex === null || draggedIndex === index) {
                    return;
                  }

                  const nextRounds = [...items];
                  const [moved] = nextRounds.splice(draggedIndex, 1);
                  nextRounds.splice(index, 0, moved);
                  setDraggedIndex(null);
                  persist(nextRounds);
                }}
                className={`min-w-[164px] rounded-2xl border px-3 py-2 shadow-sm transition ${
                  isCurrent
                    ? "border-amber-400 bg-white text-amber-950"
                    : "border-amber-200 bg-white/80 text-amber-900"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700/80">
                      {isCurrent ? "Current" : `Stage ${index + 1}`}
                    </p>
                    <input
                      value={round}
                      onChange={(event) => {
                        const nextRounds = items.map((item, itemIndex) =>
                          itemIndex === index ? event.target.value : item,
                        );
                        setItems(nextRounds);
                      }}
                      onBlur={() => persist(items)}
                      className="w-full min-w-0 rounded-lg border border-amber-200/80 bg-white/80 px-2.5 py-1.5 text-sm font-medium outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-200"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextRounds = items.filter(
                        (_, itemIndex) => itemIndex !== index,
                      );
                      persist(nextRounds);
                    }}
                    className="rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-700 transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    x
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
