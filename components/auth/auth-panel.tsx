import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/breadcrumbs";

type AuthPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
  sideTitle: string;
  sideCopy: string;
  sideHighlights?: Array<{ title: string; copy: string }>;
  sideStats?: Array<{ label: string; value: string }>;
};

export function AuthPanel({
  eyebrow,
  title,
  description,
  breadcrumbs,
  children,
  sideTitle,
  sideCopy,
  sideHighlights,
  sideStats,
}: AuthPanelProps) {
  const highlights = sideHighlights ?? [
    {
      title: "Board-first workflow",
      copy: "Move applications across real hiring stages without flattening everything into one generic status.",
    },
    {
      title: "Interview round tracking",
      copy: "Keep current round context visible, attach stage notes, and track progress through multi-step loops.",
    },
    {
      title: "Complete role dossiers",
      copy: "Store recruiter details, stage notes, and application metadata in one place that stays readable.",
    },
  ];
  const stats = sideStats ?? [
    { label: "Views", value: "Board + list" },
    { label: "Context", value: "Recruiters + notes" },
    { label: "Pipeline", value: "Flexible interviews" },
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f6f1e7_0%,#f2ebdf_40%,#e6efe9_100%)] px-4 py-8 text-stone-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative overflow-hidden rounded-4xl border border-white/50 bg-[linear-gradient(180deg,rgba(12,18,19,0.96)_0%,rgba(28,43,44,0.95)_100%)] p-8 text-stone-50 shadow-[0_30px_80px_rgba(21,24,22,0.24)] sm:p-10 lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(103,232,249,0.28),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.18),transparent_24%)]" />
          <div className="relative flex h-full flex-col justify-between gap-10">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.35em] text-sky-200/90">
                Applin
              </p>
              <h2 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
                {sideTitle}
              </h2>
              <p className="max-w-lg text-base leading-8 text-stone-300">
                {sideCopy}
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                {stats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[1.4rem] border border-white/10 bg-white/7 p-4 backdrop-blur"
                  >
                    <p className="text-[11px] uppercase tracking-[0.24em] text-stone-300">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-white/10 bg-white/6 p-4 backdrop-blur"
                >
                  <p className="mb-2 text-sm font-medium text-white">
                    {item.title}
                  </p>
                  <p className="text-sm leading-6 text-stone-300">
                    {item.copy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-4xl border border-stone-200/70 bg-white/90 p-8 shadow-[0_30px_80px_rgba(86,83,75,0.12)] backdrop-blur sm:p-10 lg:p-12">
          <div className="mx-auto flex h-full max-w-md flex-col justify-center gap-8">
            <div className="space-y-3">
              {breadcrumbs && breadcrumbs.length > 0 ? (
                <Breadcrumbs items={breadcrumbs} variant="auth" />
              ) : null}
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">
                {eyebrow}
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-stone-950">
                {title}
              </h1>
              <p className="text-sm leading-7 text-stone-600">{description}</p>
            </div>
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}
