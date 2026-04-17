import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/applications");
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f7f4ec_0%,_#f4efe5_30%,_#ece4d4_100%)] text-stone-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-10 flex items-center justify-between rounded-full border border-white/70 bg-white/80 px-5 py-3 shadow-[0_18px_55px_rgba(87,83,78,0.12)] backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-stone-950 text-sm font-semibold text-stone-50">
              AP
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                Applin
              </p>
              <p className="text-sm text-stone-600">AI-powered job tracker</p>
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
              className="rounded-full bg-stone-950 px-4 py-2 font-medium text-white transition hover:bg-stone-800"
            >
              Start free
            </Link>
          </nav>
        </header>

        <main className="grid flex-1 items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-8">
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-700">
                Modern search workflow
              </p>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-stone-950 sm:text-6xl lg:text-7xl">
                Clean tracking for hiring pipelines that never follow the same
                script twice.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-stone-600 sm:text-lg">
                Applin gives every application a calm, modern dossier: flexible
                stages, structured notes, and a dashboard that keeps your search
                readable when it starts to sprawl.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="rounded-full bg-stone-950 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-stone-800"
              >
                Create your workspace
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-stone-200 px-6 py-3.5 text-sm font-medium text-stone-700 transition hover:bg-white/70"
              >
                Sign in to continue
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                [
                  "Flexible statuses",
                  "Track Screening or Interview Round 4 without bending your process into fixed steps.",
                ],
                [
                  "Focused dossiers",
                  "Each role gets its own detail page, notes, and timeline-ready metadata.",
                ],
                [
                  "Built for momentum",
                  "Fast CRUD flows, clean auth, and a backend already wired for product growth.",
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

          <section className="relative overflow-hidden rounded-[2.2rem] border border-white/60 bg-[linear-gradient(180deg,_rgba(16,24,24,0.98)_0%,_rgba(29,44,45,0.96)_100%)] p-6 text-stone-50 shadow-[0_30px_80px_rgba(36,35,32,0.25)] sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(103,232,249,0.26),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.18),_transparent_24%)]" />
            <div className="relative space-y-6">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-300">
                      Highlighted role
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                      OpenAI · Software Engineer
                    </h2>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">
                    Interview Round 2
                  </span>
                </div>
                <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/7 p-4">
                    <dt className="text-xs uppercase tracking-[0.18em] text-stone-300">
                      Location
                    </dt>
                    <dd className="mt-2 text-sm font-medium">
                      San Francisco, CA
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-white/7 p-4">
                    <dt className="text-xs uppercase tracking-[0.18em] text-stone-300">
                      Notes
                    </dt>
                    <dd className="mt-2 text-sm font-medium">2 prep entries</dd>
                  </div>
                </dl>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.24em] text-stone-300">
                    Pipeline board
                  </p>
                  <div className="mt-4 space-y-3">
                    {[
                      ["Example Corp", "Screening"],
                      ["Northstar AI", "Applied"],
                      ["Studio Labs", "Offer"],
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

                <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.24em] text-stone-300">
                    Working note
                  </p>
                  <p className="mt-4 text-sm leading-7 text-stone-200">
                    “Recruiter emphasized product intuition and systems
                    tradeoffs. Bring 2-3 stories that connect ambiguity with
                    execution.”
                  </p>
                  <div className="mt-6 rounded-2xl border border-dashed border-white/15 px-4 py-3 text-xs uppercase tracking-[0.24em] text-stone-300">
                    Stored directly in the role dossier
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
