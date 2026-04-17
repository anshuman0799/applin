type AuthPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  sideTitle: string;
  sideCopy: string;
};

export function AuthPanel({
  eyebrow,
  title,
  description,
  children,
  sideTitle,
  sideCopy,
}: AuthPanelProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f6f1e7_0%,_#f2ebdf_40%,_#e6efe9_100%)] px-4 py-8 text-stone-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-[linear-gradient(180deg,_rgba(12,18,19,0.96)_0%,_rgba(28,43,44,0.95)_100%)] p-8 text-stone-50 shadow-[0_30px_80px_rgba(21,24,22,0.24)] sm:p-10 lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(103,232,249,0.28),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.18),_transparent_24%)]" />
          <div className="relative flex h-full flex-col justify-between gap-10">
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.35em] text-sky-200">
                Applin
              </p>
              <h2 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
                {sideTitle}
              </h2>
              <p className="max-w-lg text-base leading-8 text-stone-300">
                {sideCopy}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                [
                  "Clarity first",
                  "See your search in one place instead of scattered tabs and notes.",
                ],
                [
                  "Flexible stages",
                  "Track Screening, Interview Round 3, or any stage that fits the role.",
                ],
                [
                  "Notes that matter",
                  "Capture recruiter signals, prep insights, and follow-up context.",
                ],
              ].map(([label, copy]) => (
                <div
                  key={label}
                  className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4 backdrop-blur"
                >
                  <p className="mb-2 text-sm font-medium text-white">{label}</p>
                  <p className="text-sm leading-6 text-stone-300">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-stone-200/70 bg-white/90 p-8 shadow-[0_30px_80px_rgba(86,83,75,0.12)] backdrop-blur sm:p-10 lg:p-12">
          <div className="mx-auto flex h-full max-w-md flex-col justify-center gap-8">
            <div className="space-y-3">
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
