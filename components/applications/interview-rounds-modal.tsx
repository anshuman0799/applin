"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { Application } from "@/types";
import { getApplicationStageLabel, toneFromStatus } from "@/lib/utils";
import { InterviewRoundsEditor } from "@/components/applications/interview-rounds-editor";

type InterviewRoundsModalProps = {
  application: Application;
  onClose: () => void;
};

export function InterviewRoundsModal({
  application,
  onClose,
}: InterviewRoundsModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close interview rounds dialog"
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/45 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-5xl rounded-4xl border border-white/60 bg-[#fbf8f1] p-6 shadow-[0_30px_90px_rgba(25,23,20,0.22)] sm:p-7">
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-stone-400">
              Interview rounds
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
              {application.company} · {application.role}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/applications/${application.id}`}
              onClick={onClose}
              className="rounded-full border border-sky-200 bg-sky-100 px-3 py-1.5 text-sm font-medium text-sky-950 transition hover:bg-sky-200"
            >
              Open application details
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
            >
              Close
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${toneFromStatus(application.status)}`}
          >
            {getApplicationStageLabel(
              application.status,
              application.interviewRounds,
            )}
          </span>
        </div>

        <div className="mt-6">
          <InterviewRoundsEditor
            applicationId={application.id}
            rounds={application.interviewRounds}
            status={application.status}
          />
        </div>
      </div>
    </div>
  );
}
