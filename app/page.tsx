import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export default async function Home() {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/applications");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.12),transparent_22%),linear-gradient(180deg,#f7f4ec_0%,#f2ebdf_32%,#e7dfcf_100%)] text-stone-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-10 flex items-center justify-between rounded-full border border-white/70 bg-white/82 px-5 py-3 shadow-[0_18px_55px_rgba(87,83,78,0.12)] backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-stone-950 text-sm font-semibold text-stone-50">
              AP
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                Applin
              </p>
              <p className="text-sm text-stone-600">
                Application operating system
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/login"
              className="rounded-full border border-stone-200 px-4 py-2 font-medium text-stone-700 transition hover:bg-stone-50"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-full border border-amber-200 bg-amber-200 px-4 py-2 font-medium text-stone-950 transition hover:bg-amber-100"
            >
              Start free
            </Link>
          </nav>
        </header>

        <main className="grid flex-1 items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-8">
            <div className="space-y-5">
              <Breadcrumbs items={[{ label: "Home" }]} variant="landing" />
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-700">
                Built for real hiring loops
              </p>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-stone-950 sm:text-6xl lg:text-7xl">
                A calmer system for applications, interviews, recruiter context,
                and every note in between.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-stone-600 sm:text-lg">
                Applin combines a stage-based board, a filterable list, and
                detailed role dossiers so you can manage a growing search
                without losing the context behind each company, recruiter, or
                interview round.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Flexible pipeline stages that match how companies actually hire",
                  "Interview rounds with current-round status and round-specific notes",
                  "Recruiter details stored directly with each application",
                  "Board and list views for both momentum and filtering",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/72 px-4 py-3 shadow-[0_12px_35px_rgba(87,83,78,0.06)]"
                  >
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sky-100 text-xs font-semibold text-sky-900">
                      ✓
                    </span>
                    <p className="text-sm leading-6 text-stone-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="rounded-full border border-amber-200 bg-amber-200 px-6 py-3.5 text-sm font-medium text-stone-950 transition hover:bg-amber-100"
              >
                Create your workspace
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-stone-300 bg-white/80 px-6 py-3.5 text-sm font-medium text-stone-800 shadow-[0_12px_28px_rgba(87,83,78,0.08)] transition hover:bg-white"
              >
                Sign in to continue
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                [
                  "Board that stays readable",
                  "Move roles by stage and keep the highest-signal next action visible instead of buried in scattered notes.",
                ],
                [
                  "Role dossiers with depth",
                  "Every application has its own detail surface for notes, recruiter information, interview rounds, and stage history.",
                ],
                [
                  "List view for fast slicing",
                  "Filter by category, stage, search text, and date range when you need to audit the whole pipeline quickly.",
                ],
              ].map(([title, copy]) => (
                <article
                  key={title}
                  className="rounded-[1.75rem] border border-white/70 bg-white/75 p-5 shadow-[0_20px_60px_rgba(87,83,78,0.08)] backdrop-blur"
                >
                  <h2 className="text-lg font-semibold tracking-tight text-stone-950">
                    {title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-stone-600">
                    {copy}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[2.2rem] border border-white/60 bg-[linear-gradient(180deg,rgba(16,24,24,0.98)_0%,rgba(29,44,45,0.96)_100%)] p-6 text-stone-50 shadow-[0_30px_80px_rgba(36,35,32,0.25)] sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(103,232,249,0.26),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.18),transparent_24%)]" />
            <div className="relative space-y-6">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5 backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-300">
                      Live role dossier
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                      Anthropic · Platform Engineer
                    </h2>
                    <p className="mt-2 max-w-md text-sm leading-7 text-stone-300">
                      Keep recruiter context, round-specific notes, and current
                      interview state together so prep stays fast before every
                      step.
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">
                    Interview Round 2
                  </span>
                </div>
                <dl className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/7 p-4">
                    <dt className="text-xs uppercase tracking-[0.18em] text-stone-300">
                      Recruiter
                    </dt>
                    <dd className="mt-2 text-sm font-medium">Jordan Lee</dd>
                  </div>
                  <div className="rounded-2xl bg-white/7 p-4">
                    <dt className="text-xs uppercase tracking-[0.18em] text-stone-300">
                      Current stage
                    </dt>
                    <dd className="mt-2 text-sm font-medium">
                      Interview · Round 2
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-white/7 p-4">
                    <dt className="text-xs uppercase tracking-[0.18em] text-stone-300">
                      Notes attached
                    </dt>
                    <dd className="mt-2 text-sm font-medium">3 stage notes</dd>
                  </div>
                </dl>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.24em] text-stone-300">
                    Pipeline board
                  </p>
                  <div className="mt-4 space-y-3">
                    {[
                      ["Stripe", "Applied"],
                      ["Notion", "Screening"],
                      ["Vercel", "Interview Round 3"],
                    ].map(([company, stage]) => (
                      <div
                        key={company}
                        className="flex items-center justify-between rounded-2xl bg-white/7 px-4 py-3 text-sm"
                      >
                        <span>{company}</span>
                        <span className="text-stone-300">{stage}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.24em] text-stone-300">
                    Filterable list view
                  </p>
                  <div className="mt-4 space-y-3 rounded-[1.4rem] border border-white/10 bg-white/7 p-4">
                    <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-200">
                      <span className="rounded-full bg-white/10 px-3 py-1">
                        Accepted
                      </span>
                      <span className="rounded-full bg-white/10 px-3 py-1">
                        Interview
                      </span>
                      <span className="rounded-full bg-white/10 px-3 py-1">
                        Remote
                      </span>
                    </div>
                    <p className="text-sm leading-7 text-stone-200">
                      Search by company, slice by stage, and isolate accepted or
                      inactive roles without losing access to each role’s full
                      context.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <section className="mt-10 grid gap-5 lg:grid-cols-3">
          {[
            {
              title: "1. Capture the opportunity",
              copy: "Create a role with company, link, location, and recruiter details so the basics never drift out of reach.",
            },
            {
              title: "2. Run the pipeline with context",
              copy: "Move across stages, attach round-aware notes, and keep the current interview state visible on both the board and detail page.",
            },
            {
              title: "3. Review the search clearly",
              copy: "Use overview stats and the filterable list page to understand where your momentum, follow-ups, and outcomes actually sit.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-[1.9rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_55px_rgba(87,83,78,0.08)]"
            >
              <h2 className="text-xl font-semibold tracking-tight text-stone-950">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-stone-600">
                {item.copy}
              </p>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
