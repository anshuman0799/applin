import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/require-user";
import { AppShell } from "@/components/app-shell";
import { ApplicationCreateForm } from "@/components/applications/application-create-form";
import { PipelineBoard } from "@/components/applications/pipeline-board";
import { isActiveStage, isInactiveStage } from "@/lib/utils";

export default async function ApplicationsPage() {
  const user = await requireUser();
  const applications = await db.application.findMany({
    where: { userId: user.id },
    orderBy: { appliedAt: "asc" },
    include: { _count: { select: { notes: true } } },
  });

  const totalCount = applications.length;
  const activeCount = applications.filter((application) =>
    isActiveStage(application.status),
  ).length;
  const inactiveCount = applications.filter((application) =>
    isInactiveStage(application.status),
  ).length;

  return (
    <AppShell
      user={user}
      eyebrow="Pipeline overview"
      title="A minimal command desk for every role you are actively steering."
      description="Create applications, keep each stage human-readable, and jump into a dossier with notes and history in one click."
    >
      <main className="flex flex-1 flex-col gap-6">
        <section className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              [
                "Jobs applied",
                String(totalCount),
                "/applications/list?category=all",
              ],
              [
                "Active",
                String(activeCount),
                "/applications/list?category=active",
              ],
              [
                "Inactive",
                String(inactiveCount),
                "/applications/list?category=inactive",
              ],
            ].map(([label, value, href]) => (
              <Link
                key={label}
                href={href}
                className="rounded-[1.5rem] border border-stone-200/80 bg-stone-50/85 p-5 transition hover:-translate-y-0.5 hover:bg-white"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-stone-400">
                  {label}
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
                  {value}
                </p>
                <p className="mt-3 text-sm font-medium text-stone-600">
                  Open filtered list
                </p>
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-stone-400">
                Applications
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
                Pipeline board
              </h2>
            </div>
            <Link
              href="/applications/list"
              className="text-sm font-medium text-stone-600 underline decoration-sky-300 underline-offset-4"
            >
              Open the filterable list view
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white/60 p-10 text-center shadow-[0_20px_60px_rgba(87,83,78,0.05)]">
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
