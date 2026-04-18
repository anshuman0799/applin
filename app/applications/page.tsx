import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/require-user";
import { AppShell } from "@/components/app-shell";
import { ApplicationCreateForm } from "@/components/applications/application-create-form";
import { PipelineBoard } from "@/components/applications/pipeline-board";
import {
  isActiveStage,
  isInactiveStage,
  normalizeApplicationStatus,
} from "@/lib/utils";

function renderOverviewTileIcon(label: string) {
  if (label === "Jobs applied") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
        <path
          d="M7 4.75h10A2.25 2.25 0 0 1 19.25 7v10A2.25 2.25 0 0 1 17 19.25H7A2.25 2.25 0 0 1 4.75 17V7A2.25 2.25 0 0 1 7 4.75Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M8.5 9.25h7M8.5 12h7M8.5 14.75H13"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (label === "Active") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
        <path
          d="M5 16.25 9.25 12l2.75 2.75L19 7.75"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.75 7.75H19v4.25"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (label === "Inactive") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
        <path
          d="M7.5 7.5 16.5 16.5M16.5 7.5l-9 9"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <circle
          cx="12"
          cy="12"
          r="8.25"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
      <path
        d="M8.75 12.25 10.9 14.4 15.25 10.05"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="8.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default async function ApplicationsPage() {
  const user = await requireUser();
  const applications = await db.application.findMany({
    where: { userId: user.id },
    orderBy: { appliedAt: "asc" },
    include: {
      _count: { select: { notes: true } },
      notes: { select: { id: true, stage: true } },
    },
  });

  const totalCount = applications.length;
  const activeCount = applications.filter((application) =>
    isActiveStage(application.status),
  ).length;
  const inactiveCount = applications.filter((application) =>
    isInactiveStage(application.status),
  ).length;
  const acceptedCount = applications.filter(
    (application) =>
      normalizeApplicationStatus(application.status) === "Accepted",
  ).length;

  return (
    <AppShell
      user={user}
      breadcrumbs={[
        { label: "Applications", href: "/applications" },
        { label: "Overview" },
      ]}
      eyebrow="Overview"
      title={
        <>
          Welcome back,{" "}
          <span className="text-sky-700">{user.name ?? "there"}</span>
        </>
      }
      description={
        <>
          Keep your <em className="not-italic">job</em> search organized,
          current, and easy to act on.
        </>
      }
    >
      <main className="flex flex-1 flex-col gap-6">
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-stone-400">
                Applications
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
                Jobs board
              </h2>
            </div>
            <Link
              href="/applications/list"
              className="inline-flex rounded-full border border-sky-200 bg-sky-100 px-4 py-2 text-sm font-medium text-sky-950 transition hover:bg-sky-200"
            >
              View all applications
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              [
                "Jobs applied",
                String(totalCount),
                "/applications/list?category=all",
                "border-stone-200/80 bg-stone-100/90 text-stone-950 hover:bg-stone-200/80",
                "text-stone-500",
              ],
              [
                "Active",
                String(activeCount),
                "/applications/list?category=active",
                "border-sky-200/80 bg-sky-50/90 text-sky-950 hover:bg-sky-100/90",
                "text-sky-700/80",
              ],
              [
                "Inactive",
                String(inactiveCount),
                "/applications/list?category=inactive",
                "border-rose-200/80 bg-rose-50/90 text-rose-950 hover:bg-rose-100/90",
                "text-rose-700/80",
              ],
              [
                "Accepted",
                String(acceptedCount),
                "/applications/list?status=Accepted",
                "border-emerald-200/80 bg-emerald-50/90 text-emerald-950 hover:bg-emerald-100/90",
                "text-emerald-700/80",
              ],
            ].map(([label, value, href, cardTone, labelTone]) => (
              <Link
                key={label}
                href={href}
                className={`rounded-3xl border p-5 transition hover:-translate-y-0.5 ${cardTone}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className={`text-xs uppercase tracking-[0.2em] ${labelTone}`}
                    >
                      {label}
                    </p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight">
                      {value}
                    </p>
                  </div>
                  <span
                    className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-current/10 bg-white/55 ${labelTone}`}
                    aria-hidden="true"
                  >
                    {renderOverviewTileIcon(label)}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {applications.length === 0 ? (
            <div className="rounded-4xl border border-dashed border-stone-300 bg-white/60 p-10 text-center shadow-[0_20px_60px_rgba(87,83,78,0.05)]">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-stone-400">
                Empty board
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">
                No applications yet
              </h3>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-stone-600">
                Start with one role, give it a real status like Screening or
                Interview, and let the board grow from there.
              </p>
            </div>
          ) : (
            <PipelineBoard applications={applications} />
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="rounded-[1.9rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(87,83,78,0.1)]">
            <div className="mb-5 space-y-2">
              <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
                New application
              </p>
              <h2 className="text-xl font-semibold tracking-tight text-stone-950">
                Add a fresh opportunity
              </h2>
              <p className="text-sm leading-6 text-stone-600">
                New jobs start in Applied so you can move them through the board
                after creation.
              </p>
            </div>
            <ApplicationCreateForm compact />
          </section>

          <section className="rounded-[1.9rem] border border-stone-200/80 bg-stone-50/80 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-400">
              All applications
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-stone-950">
              Open the full filters page
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Search everything in one place with stage, date, and category
              filters.
            </p>
            <Link
              href="/applications/list"
              className="mt-4 inline-flex rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
            >
              View all applications
            </Link>
          </section>
        </section>
      </main>
    </AppShell>
  );
}
