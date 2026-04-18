import Link from "next/link";
import type { ApplicationSummary } from "@/types";
import {
  formatRelativeDate,
  getApplicationStageLabel,
  normalizeApplicationStatus,
  normalizeInterviewRounds,
  toneFromStatus,
} from "@/lib/utils";

export function ApplicationCard({
  application,
}: {
  application: ApplicationSummary;
}) {
  const interviewRounds = Array.isArray(application.interviewRounds)
    ? application.interviewRounds
    : [];
  const roundsCount =
    normalizeApplicationStatus(application.status) === "Interview"
      ? normalizeInterviewRounds(interviewRounds).length
      : interviewRounds.length;

  return (
    <Link
      href={`/applications/${application.id}`}
      className="group flex flex-col gap-5 rounded-[1.75rem] border border-white/70 bg-white/90 p-5 shadow-[0_24px_60px_rgba(87,83,78,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_30px_80px_rgba(87,83,78,0.12)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-stone-400">
            {application.company}
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-stone-950">
            {application.role}
          </h3>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${toneFromStatus(application.status)}`}
        >
          {getApplicationStageLabel(application.status, interviewRounds)}
        </span>
      </div>

      <div className="grid gap-3 text-sm text-stone-600 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
            Location
          </p>
          <p className="mt-1 font-medium text-stone-800">
            {application.location || "Flexible / not set"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
            Notes / rounds
          </p>
          <p className="mt-1 font-medium text-stone-800">
            {application._count.notes}{" "}
            {application._count.notes === 1 ? "note" : "notes"} · {roundsCount}{" "}
            {roundsCount === 1 ? "round" : "rounds"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-stone-200 pt-4 text-sm text-stone-500">
        <span>Updated {formatRelativeDate(application.updatedAt)}</span>
        <span className="font-medium text-stone-900 transition group-hover:translate-x-1">
          Open dossier
        </span>
      </div>
    </Link>
  );
}
