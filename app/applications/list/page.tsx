import Link from "next/link";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/require-user";
import { AppShell } from "@/components/app-shell";
import { ApplicationCard } from "@/components/applications/application-card";
import { ApplicationsFilters } from "@/components/applications/applications-filters";
import {
  ACTIVE_APPLICATION_STAGES,
  INACTIVE_APPLICATION_STAGES,
  normalizeCategory,
  normalizeStageForCategory,
} from "@/lib/utils";

type SearchParams = Promise<{
  category?: string;
  status?: string;
  from?: string;
  to?: string;
  q?: string;
}>;

export default async function ApplicationsListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const category = normalizeCategory(params.category);
  const status = normalizeStageForCategory(category, params.status);
  const search = params.q?.trim() ?? "";

  const where: Prisma.ApplicationWhereInput = {
    userId: user.id,
  };

  if (category === "active") {
    where.status = { in: [...ACTIVE_APPLICATION_STAGES] };
  }

  if (category === "inactive") {
    where.status = { in: [...INACTIVE_APPLICATION_STAGES] };
  }

  if (status !== "all") {
    where.status = status;
  }

  if (params.from || params.to) {
    where.appliedAt = {};

    if (params.from) {
      where.appliedAt.gte = new Date(params.from);
    }

    if (params.to) {
      where.appliedAt.lte = new Date(`${params.to}T23:59:59.999Z`);
    }
  }

  if (search) {
    where.OR = [
      { company: { contains: search, mode: "insensitive" } },
      { role: { contains: search, mode: "insensitive" } },
      { location: { contains: search, mode: "insensitive" } },
    ];
  }

  const applications = await db.application.findMany({
    where,
    orderBy: { appliedAt: "desc" },
    include: { _count: { select: { notes: true } } },
  });

  return (
    <AppShell
      user={user}
      eyebrow="Applications index"
      title="A filterable list for every role in one place"
      description="Use category, stage, date, and search filters to slice your pipeline without losing access to the full dossier view."
      compactHeader
    >
      <main className="space-y-6">
        <section className="rounded-[1.9rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(87,83,78,0.1)]">
          <ApplicationsFilters
            category={category}
            status={status}
            search={search}
            from={params.from ?? ""}
            to={params.to ?? ""}
          />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-400">
                Results
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
                {applications.length} applications match this view
              </h2>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="rounded-[1.9rem] border border-dashed border-stone-300 bg-white/60 p-10 text-center text-sm text-stone-500">
              No applications match the current filters.
            </div>
          ) : (
            <div className="grid gap-5 xl:grid-cols-2">
              {applications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </AppShell>
  );
}
