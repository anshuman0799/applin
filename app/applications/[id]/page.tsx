import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/require-user";
import { AppShell } from "@/components/app-shell";
import { ApplicationStageEditor } from "@/components/applications/application-stage-editor";
import { ApplicationEditForm } from "@/components/applications/application-edit-form";
import { DeleteApplicationButton } from "@/components/applications/delete-application-button";
import {
  formatDate,
  getApplicationStageLabel,
  toneFromStatus,
} from "@/lib/utils";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const application = await db.application.findUnique({
    where: { id },
    include: {
      notes: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          applicationId: true,
          stage: true,
          content: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!application || application.userId !== user.id) {
    notFound();
  }

  return (
    <AppShell
      user={user}
      eyebrow="Application dossier"
      title={`${application.company} · ${application.role}`}
      description="Update the application details, keep the stage language specific to this company, and capture every note that sharpens your next move."
    >
      <main className="flex flex-1 flex-col gap-6">
        <section className="rounded-[1.9rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(87,83,78,0.1)]">
          <ApplicationStageEditor application={application} />
        </section>

        <section className="space-y-6">
          <div className="rounded-[1.9rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(87,83,78,0.1)]">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-5">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.22em] text-stone-400">
                  Status snapshot
                </p>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${toneFromStatus(application.status)}`}
                >
                  {getApplicationStageLabel(
                    application.status,
                    application.interviewRounds,
                  )}
                </span>
                <p className="text-sm text-stone-500">
                  Applied {formatDate(application.appliedAt)}
                </p>
              </div>
              <DeleteApplicationButton applicationId={application.id} />
            </div>

            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div className="rounded-2xl bg-stone-50 p-4">
                <dt className="text-xs uppercase tracking-[0.18em] text-stone-400">
                  Company
                </dt>
                <dd className="mt-2 font-medium text-stone-900">
                  {application.company}
                </dd>
              </div>
              <div className="rounded-2xl bg-stone-50 p-4">
                <dt className="text-xs uppercase tracking-[0.18em] text-stone-400">
                  Role
                </dt>
                <dd className="mt-2 font-medium text-stone-900">
                  {application.role}
                </dd>
              </div>
              <div className="rounded-2xl bg-stone-50 p-4">
                <dt className="text-xs uppercase tracking-[0.18em] text-stone-400">
                  Location
                </dt>
                <dd className="mt-2 font-medium text-stone-900">
                  {application.location || "Not specified"}
                </dd>
              </div>
              <div className="rounded-2xl bg-stone-50 p-4">
                <dt className="text-xs uppercase tracking-[0.18em] text-stone-400">
                  Job link
                </dt>
                <dd className="mt-2 font-medium text-stone-900">
                  {application.jobLink ? (
                    <a
                      href={application.jobLink}
                      target="_blank"
                      rel="noreferrer"
                      className="underline decoration-sky-300 underline-offset-4"
                    >
                      Open posting
                    </a>
                  ) : (
                    "No link added"
                  )}
                </dd>
              </div>
            </dl>
          </div>

          <section className="rounded-[1.9rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(87,83,78,0.1)]">
            <div className="mb-5 space-y-2">
              <p className="text-xs uppercase tracking-[0.22em] text-stone-400">
                Edit details
              </p>
              <h2 className="text-xl font-semibold tracking-tight text-stone-950">
                Keep the record accurate
              </h2>
            </div>
            <ApplicationEditForm application={application} />
          </section>
        </section>
      </main>
    </AppShell>
  );
}
