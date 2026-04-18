"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ApplicationWithNotes } from "@/types";
import { DeleteApplicationButton } from "@/components/applications/delete-application-button";
import { useAppToast } from "@/components/ui/toast-provider";
import {
  formatDate,
  getApplicationStageLabel,
  toneFromStatus,
} from "@/lib/utils";

function parseRecruiterPhone(value: string | null | undefined) {
  if (!value) {
    return { countryCode: "1", phoneNumber: "" };
  }

  const normalized = value.replace(/\s+/g, "").trim();
  const match = normalized.match(/^\+?(\d{1,4})(\d{10})$/);

  if (!match) {
    return {
      countryCode: normalized.replace(/\D/g, "").slice(0, 4) || "1",
      phoneNumber: "",
    };
  }

  return {
    countryCode: match[1],
    phoneNumber: match[2],
  };
}

function getInitialDraft(application: ApplicationWithNotes) {
  const parsedPhone = parseRecruiterPhone(application.recruiterPhone);

  return {
    company: application.company,
    role: application.role,
    location: application.location ?? "",
    jobLink: application.jobLink ?? "",
    recruiterName: application.recruiterName ?? "",
    recruiterEmail: application.recruiterEmail ?? "",
    recruiterCountryCode: parsedPhone.countryCode,
    recruiterPhoneNumber: parsedPhone.phoneNumber,
    recruiterSocial: application.recruiterSocial ?? "",
  };
}

function getLinkHost(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
    >
      <path
        d="m5.833 7.917 4.167 4.166 4.167-4.166"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ContactLabel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
        {title}
      </p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

export function ApplicationEditForm({
  application,
}: {
  application: ApplicationWithNotes;
}) {
  const router = useRouter();
  const { showToast } = useAppToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isRecruiterOpen, setIsRecruiterOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState(() => getInitialDraft(application));

  useEffect(() => {
    setDraft(getInitialDraft(application));
    setIsEditing(false);
    setIsRecruiterOpen(false);
    setError(null);
  }, [application]);

  const hasRecruiterDetails = Boolean(
    application.recruiterName ||
    application.recruiterEmail ||
    application.recruiterPhone ||
    application.recruiterSocial,
  );

  const recruiterDetailCount = [
    application.recruiterName,
    application.recruiterEmail,
    application.recruiterPhone,
    application.recruiterSocial,
  ].filter(Boolean).length;

  const postingHost = getLinkHost(application.jobLink);

  async function copyRecruiterValue(
    value: string,
    fieldLabel: "Email" | "Phone number",
  ) {
    try {
      await navigator.clipboard.writeText(value);
      showToast(`${fieldLabel} copied`, "success");
    } catch {
      showToast(`Could not copy ${fieldLabel.toLowerCase()}`, "error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[1.65rem] border border-stone-200/80 bg-[linear-gradient(180deg,#fbfaf7_0%,#f7f2e8_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-5">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">
              Details
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${toneFromStatus(application.status)}`}
              >
                {getApplicationStageLabel(
                  application.status,
                  application.interviewRounds,
                )}
              </span>
              <span className="inline-flex rounded-full border border-stone-200 bg-white/85 px-3 py-1 text-xs font-medium text-stone-600">
                Applied {formatDate(application.appliedAt)}
              </span>
              <span className="inline-flex rounded-full border border-stone-200 bg-white/85 px-3 py-1 text-xs font-medium text-stone-600">
                {application.location}
              </span>
              {postingHost ? (
                <span className="inline-flex rounded-full border border-stone-200 bg-white/85 px-3 py-1 text-xs font-medium text-stone-600">
                  {postingHost}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!isEditing && hasRecruiterDetails ? (
              <button
                type="button"
                onClick={() => setIsRecruiterOpen((current) => !current)}
                className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/90 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-white"
              >
                <span>
                  Recruiter details
                  {recruiterDetailCount > 0 ? ` (${recruiterDetailCount})` : ""}
                </span>
                <ChevronIcon open={isRecruiterOpen} />
              </button>
            ) : null}

            {application.jobLink ? (
              <a
                href={application.jobLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full border border-sky-200 bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-950 transition hover:bg-sky-200"
              >
                Open posting
              </a>
            ) : null}

            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(getInitialDraft(application));
                    setIsEditing(false);
                    setError(null);
                  }}
                  className="rounded-full border border-stone-200 bg-white/90 px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    setError(null);

                    startTransition(async () => {
                      const response = await fetch(
                        `/api/applications/${application.id}`,
                        {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            ...draft,
                            recruiterPhone: draft.recruiterPhoneNumber?.trim()
                              ? `+${draft.recruiterCountryCode ?? "1"}${draft.recruiterPhoneNumber}`
                              : "",
                          }),
                        },
                      );

                      const data = (await response
                        .json()
                        .catch(() => null)) as {
                        error?: string;
                      } | null;

                      if (!response.ok) {
                        setError(
                          data?.error ?? "Could not update application.",
                        );
                        return;
                      }

                      setIsEditing(false);
                      router.refresh();
                      showToast("Application updated", "success");
                    });
                  }}
                  className="rounded-full bg-stone-950 px-5 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? "Saving..." : "Save changes"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded-full bg-stone-950 px-5 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
              >
                Edit Application
              </button>
            )}
          </div>
        </div>

        {!isEditing ? (
          <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="rounded-3xl border border-white/80 bg-white/88 px-4 py-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                Company
              </p>
              <p className="mt-1 text-lg font-semibold tracking-tight text-stone-950">
                {application.company}
              </p>
            </div>
            <div className="rounded-3xl border border-white/80 bg-white/88 px-4 py-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                Role
              </p>
              <p className="mt-1 text-lg font-semibold tracking-tight text-stone-950">
                {application.role}
              </p>
            </div>
          </div>
        ) : null}

        {!isEditing && hasRecruiterDetails && isRecruiterOpen ? (
          <div className="mt-4 grid gap-3 border-t border-stone-200 pt-4 sm:grid-cols-2">
            {application.recruiterName ? (
              <div className="rounded-2xl border border-white/80 bg-white px-4 py-3 shadow-sm">
                <ContactLabel title="Recruiter">
                  <p className="font-medium text-stone-900">
                    {application.recruiterName}
                  </p>
                </ContactLabel>
              </div>
            ) : null}

            {application.recruiterEmail ? (
              <button
                type="button"
                onClick={() =>
                  copyRecruiterValue(application.recruiterEmail!, "Email")
                }
                className="rounded-2xl border border-white/80 bg-white px-4 py-3 text-left shadow-sm transition hover:border-sky-100 hover:bg-sky-50/80"
              >
                <ContactLabel title="Email">
                  <p className="font-medium text-stone-900">
                    {application.recruiterEmail}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">Click to copy</p>
                </ContactLabel>
              </button>
            ) : null}

            {application.recruiterPhone ? (
              <button
                type="button"
                onClick={() =>
                  copyRecruiterValue(
                    application.recruiterPhone!,
                    "Phone number",
                  )
                }
                className="rounded-2xl border border-white/80 bg-white px-4 py-3 text-left shadow-sm transition hover:border-sky-100 hover:bg-sky-50/80"
              >
                <ContactLabel title="Phone">
                  <p className="font-medium text-stone-900">
                    {application.recruiterPhone}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">Click to copy</p>
                </ContactLabel>
              </button>
            ) : null}

            {application.recruiterSocial ? (
              <a
                href={application.recruiterSocial}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-white/80 bg-white px-4 py-3 shadow-sm transition hover:border-sky-100 hover:bg-sky-50/80"
              >
                <ContactLabel title="Social">
                  <p className="font-medium text-stone-900">Open profile</p>
                  <p className="mt-1 text-xs text-stone-500">
                    {getLinkHost(application.recruiterSocial)}
                  </p>
                </ContactLabel>
              </a>
            ) : null}
          </div>
        ) : null}
      </div>

      {isEditing ? (
        <div className="grid gap-4 text-sm lg:grid-cols-2">
          <label className="rounded-3xl border border-stone-200 bg-stone-50/80 p-4 text-stone-700">
            <span className="text-xs uppercase tracking-[0.18em] text-stone-400">
              Company
            </span>
            <input
              name="company"
              required
              value={draft.company}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  company: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 font-medium text-stone-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />
          </label>

          <label className="rounded-3xl border border-stone-200 bg-stone-50/80 p-4 text-stone-700">
            <span className="text-xs uppercase tracking-[0.18em] text-stone-400">
              Role
            </span>
            <input
              name="role"
              required
              value={draft.role}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  role: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 font-medium text-stone-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />
          </label>

          <label className="rounded-3xl border border-stone-200 bg-stone-50/80 p-4 text-stone-700">
            <span className="text-xs uppercase tracking-[0.18em] text-stone-400">
              Location
            </span>
            <input
              name="location"
              required
              value={draft.location}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  location: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 font-medium text-stone-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />
          </label>

          <label className="rounded-3xl border border-stone-200 bg-stone-50/80 p-4 text-stone-700">
            <span className="text-xs uppercase tracking-[0.18em] text-stone-400">
              Job link
            </span>
            <input
              name="jobLink"
              type="url"
              required
              value={draft.jobLink}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  jobLink: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 font-medium text-stone-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />
          </label>

          <div className="rounded-[1.6rem] border border-stone-200 bg-stone-50/80 p-4 text-stone-700 lg:col-span-2">
            <div className="mb-4 space-y-1">
              <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                Recruiter contact
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 rounded-2xl border border-white/80 bg-white/90 p-3 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                  Recruiter name
                </span>
                <input
                  name="recruiterName"
                  type="text"
                  value={draft.recruiterName}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      recruiterName: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-stone-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  placeholder="Ava Chen"
                />
              </label>

              <label className="space-y-2 rounded-2xl border border-white/80 bg-white/90 p-3 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                  Recruiter email
                </span>
                <input
                  name="recruiterEmail"
                  type="email"
                  value={draft.recruiterEmail}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      recruiterEmail: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-stone-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  placeholder="recruiter@company.com"
                />
              </label>

              <label className="space-y-2 rounded-2xl border border-white/80 bg-white/90 p-3 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                  Recruiter phone
                </span>
                <div className="flex gap-2">
                  <div className="flex w-24 items-center rounded-xl border border-stone-200 bg-white px-3">
                    <span className="text-sm font-medium text-stone-500">
                      +
                    </span>
                    <input
                      name="recruiterCountryCode"
                      type="text"
                      value={draft.recruiterCountryCode ?? ""}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          recruiterCountryCode: event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 4),
                        }))
                      }
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      className="w-full bg-transparent py-2.5 text-stone-900 outline-none"
                      placeholder="1"
                    />
                  </div>
                  <input
                    name="recruiterPhoneNumber"
                    type="tel"
                    value={draft.recruiterPhoneNumber ?? ""}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        recruiterPhoneNumber: event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10),
                      }))
                    }
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-stone-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    placeholder="10-digit phone"
                  />
                </div>
              </label>

              <label className="space-y-2 rounded-2xl border border-white/80 bg-white/90 p-3 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                  Social profile
                </span>
                <input
                  name="recruiterSocial"
                  type="url"
                  value={draft.recruiterSocial}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      recruiterSocial: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-stone-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  placeholder="https://linkedin.com/in/..."
                />
              </label>
            </div>
          </div>
        </div>
      ) : null}

      {isEditing ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-4">
          <p className="text-sm text-stone-500">
            Delete only if you want to remove the application and every attached
            note.
          </p>
          <DeleteApplicationButton applicationId={application.id} />
        </div>
      ) : null}

      {error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
