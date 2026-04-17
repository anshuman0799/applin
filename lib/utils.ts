export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export const DEFAULT_APPLICATION_STAGES = [
  {
    id: "Applied",
    label: "Applied",
    description: "Submitted and waiting for a response.",
  },
  {
    id: "Screening",
    label: "Screening",
    description: "Recruiter or hiring-manager screening.",
  },
  {
    id: "Interview",
    label: "Interview",
    description: "Active interview loop with draggable rounds.",
  },
  {
    id: "Withdrawn",
    label: "Withdrawn",
    description: "Closed by you.",
  },
  {
    id: "Rejected",
    label: "Rejected",
    description: "Closed by the company.",
  },
  {
    id: "Accepted",
    label: "Accepted",
    description: "Offer accepted and complete.",
  },
] as const;

export const ACTIVE_APPLICATION_STAGES = [
  "Applied",
  "Screening",
  "Interview",
] as const;

export const INACTIVE_APPLICATION_STAGES = [
  "Withdrawn",
  "Rejected",
  "Accepted",
] as const;

export type DashboardCategory = "all" | "active" | "inactive";

export function getAllowedStagesForCategory(category: DashboardCategory) {
  if (category === "active") {
    return [...ACTIVE_APPLICATION_STAGES];
  }

  if (category === "inactive") {
    return [...INACTIVE_APPLICATION_STAGES];
  }

  return DEFAULT_APPLICATION_STAGES.map((stage) => stage.id);
}

export function normalizeCategory(value?: string): DashboardCategory {
  if (value === "active" || value === "inactive") {
    return value;
  }

  return "all";
}

export function normalizeStageForCategory(
  category: DashboardCategory,
  status?: string,
) {
  if (!status || status === "all") {
    return "all";
  }

  const allowedStages = getAllowedStagesForCategory(category);
  return allowedStages.includes(status as (typeof allowedStages)[number])
    ? status
    : "all";
}

export function isActiveStage(status: string) {
  return ACTIVE_APPLICATION_STAGES.includes(
    status as (typeof ACTIVE_APPLICATION_STAGES)[number],
  );
}

export function isInactiveStage(status: string) {
  return INACTIVE_APPLICATION_STAGES.includes(
    status as (typeof INACTIVE_APPLICATION_STAGES)[number],
  );
}

export function getApplicationStageLabel(
  status: string,
  rounds: string[] = [],
) {
  if (status === "Interview" && rounds.length > 0) {
    if (
      rounds.length === 1 &&
      rounds[0] === DEFAULT_SINGLE_INTERVIEW_ROUND_NAME
    ) {
      return status;
    }

    return `${status} · ${rounds[rounds.length - 1]}`;
  }

  return status;
}

export const DEFAULT_SINGLE_INTERVIEW_ROUND_NAME = "Active Interview Loop";

export function normalizeInterviewRounds(rounds: string[] | null | undefined) {
  if (!rounds || rounds.length === 0) {
    return [DEFAULT_SINGLE_INTERVIEW_ROUND_NAME];
  }

  return rounds;
}

export function getDefaultInterviewRoundName(
  index: number,
  totalCount: number,
) {
  if (totalCount <= 1) {
    return DEFAULT_SINGLE_INTERVIEW_ROUND_NAME;
  }

  return `Round ${index + 1}`;
}

export function expandInterviewRounds(rounds: string[] | null | undefined) {
  const safeRounds = normalizeInterviewRounds(rounds);

  if (
    safeRounds.length === 1 &&
    safeRounds[0] === DEFAULT_SINGLE_INTERVIEW_ROUND_NAME
  ) {
    return [
      getDefaultInterviewRoundName(0, 2),
      getDefaultInterviewRoundName(1, 2),
    ];
  }

  return [
    ...safeRounds,
    getDefaultInterviewRoundName(safeRounds.length, safeRounds.length + 1),
  ];
}

export function sanitizeInterviewRoundNames(
  rounds: string[] | null | undefined,
) {
  const safeRounds = Array.isArray(rounds) ? rounds : [];
  const targetRounds =
    safeRounds.length > 0 ? safeRounds : [DEFAULT_SINGLE_INTERVIEW_ROUND_NAME];
  const totalCount = targetRounds.length;

  return targetRounds.map((round, index) => {
    const trimmed = round.trim();
    return trimmed || getDefaultInterviewRoundName(index, totalCount);
  });
}

export function collapseInterviewRoundsAfterDelete(
  rounds: string[] | null | undefined,
) {
  const safeRounds = sanitizeInterviewRoundNames(rounds);

  if (safeRounds.length !== 1) {
    return safeRounds;
  }

  return [
    /^Round \d+$/.test(safeRounds[0])
      ? DEFAULT_SINGLE_INTERVIEW_ROUND_NAME
      : safeRounds[0],
  ];
}

export function getCurrentInterviewRound(rounds: string[] | null | undefined) {
  const safeRounds = normalizeInterviewRounds(rounds);
  return safeRounds[safeRounds.length - 1];
}

export function getNextInterviewRoundName(rounds: string[] | null | undefined) {
  const expandedRounds = expandInterviewRounds(rounds);
  return expandedRounds[expandedRounds.length - 1];
}

export function formatDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatRelativeDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  const diff = date.getTime() - Date.now();
  const minutes = Math.round(diff / (1000 * 60));
  const hours = Math.round(diff / (1000 * 60 * 60));
  const days = Math.round(diff / (1000 * 60 * 60 * 24));

  if (Math.abs(minutes) < 60) {
    return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
      minutes,
      "minute",
    );
  }

  if (Math.abs(hours) < 24) {
    return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
      hours,
      "hour",
    );
  }

  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    days,
    "day",
  );
}

export function initialsFromName(name?: string | null, fallback = "A") {
  if (!name) return fallback;
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || fallback;
}

export function toneFromStatus(status: string) {
  if (status === "Accepted") {
    return "bg-emerald-100 text-emerald-900 ring-emerald-200";
  }

  if (status === "Rejected" || status === "Withdrawn") {
    return "bg-rose-100 text-rose-900 ring-rose-200";
  }

  if (status === "Screening") {
    return "bg-sky-100 text-sky-900 ring-sky-200";
  }

  if (status === "Interview") {
    return "bg-amber-100 text-amber-900 ring-amber-200";
  }

  return "bg-stone-200 text-stone-900 ring-stone-300";
}
