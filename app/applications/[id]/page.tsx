import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/require-user";
import { AppShell } from "@/components/app-shell";
import { ApplicationStageEditor } from "@/components/applications/application-stage-editor";
import { ApplicationEditForm } from "@/components/applications/application-edit-form";

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
    <AppShell user={user} eyebrow="Application Details" compactHeader>
      <main className="flex flex-1 flex-col gap-6">
        <section className="rounded-[1.9rem] border border-white/70 bg-white/90 p-5 shadow-[0_24px_60px_rgba(87,83,78,0.1)] sm:p-6">
          <ApplicationEditForm application={application} />
        </section>

        <section className="rounded-[1.9rem] border border-white/70 bg-white/90 p-5 shadow-[0_24px_60px_rgba(87,83,78,0.1)] sm:p-6">
          <ApplicationStageEditor application={application} />
        </section>
      </main>
    </AppShell>
  );
}
