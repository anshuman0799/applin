import Link from "next/link";
import { initialsFromName } from "@/lib/utils";
import { SignOutButton } from "@/components/sign-out-button";

type AppShellProps = {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
  title?: string;
  eyebrow: string;
  description?: string;
  headerActions?: React.ReactNode;
  compactHeader?: boolean;
  children: React.ReactNode;
};

export function AppShell({
  user,
  title,
  eyebrow,
  description,
  headerActions,
  compactHeader = false,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.18),transparent_32%),linear-gradient(180deg,#f7f4ec_0%,#f3efe5_42%,#ebe5d7_100%)] text-stone-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header
          className={`flex flex-col rounded-4xl border border-white/50 bg-white/70 shadow-[0_30px_80px_rgba(87,83,78,0.12)] backdrop-blur ${compactHeader ? "mb-6 gap-4 px-5 py-4 sm:px-6" : "mb-8 gap-6 px-5 py-5 sm:px-7"}`}
        >
          <div
            className={`flex flex-col md:flex-row md:items-start md:justify-between ${compactHeader ? "gap-4" : "gap-5"}`}
          >
            <div
              className={`flex flex-col ${compactHeader ? "gap-4" : "gap-5"}`}
            >
              <div className="flex items-center gap-3">
                <Link
                  href="/applications"
                  className="inline-flex items-center gap-3"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-stone-900 text-sm font-semibold text-stone-50 shadow-lg shadow-stone-900/15">
                    AP
                  </span>
                  <p className="text-sm font-semibold text-stone-700">Applin</p>
                </Link>
              </div>

              <div className={compactHeader ? "space-y-2" : "space-y-3"}>
                <p
                  className={`${compactHeader ? "text-sm tracking-[0.22em]" : "text-xs tracking-[0.28em]"} font-semibold uppercase text-sky-700`}
                >
                  {eyebrow}
                </p>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
                  <div className={compactHeader ? "space-y-2" : "space-y-3"}>
                    {title ? (
                      <h1
                        className={`max-w-3xl font-semibold tracking-tight text-stone-950 ${compactHeader ? "text-2xl sm:text-4xl" : "text-3xl sm:text-5xl"}`}
                      >
                        {title}
                      </h1>
                    ) : null}
                    {description ? (
                      <p
                        className={`max-w-2xl text-stone-600 ${compactHeader ? "text-sm leading-6" : "text-sm leading-7 sm:text-base"}`}
                      >
                        {description}
                      </p>
                    ) : null}
                  </div>
                  {headerActions ? (
                    <div className="flex shrink-0 items-center gap-3">
                      {headerActions}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div
              className={`flex items-center justify-between gap-4 rounded-3xl border border-stone-200/80 bg-stone-50/90 md:justify-end ${compactHeader ? "px-3.5 py-2.5 md:min-w-[260px]" : "px-4 py-3 md:min-w-[280px]"}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`grid place-items-center rounded-2xl bg-sky-100 text-sm font-semibold text-sky-900 ${compactHeader ? "h-10 w-10" : "h-11 w-11"}`}
                >
                  {initialsFromName(
                    user.name,
                    user.email?.[0]?.toUpperCase() ?? "A",
                  )}
                </div>
                <div>
                  <p
                    className={`font-medium text-stone-900 ${compactHeader ? "text-xs sm:text-sm" : "text-sm"}`}
                  >
                    {user.name ?? "Applin user"}
                  </p>
                  <p className="text-xs text-stone-500">{user.email}</p>
                </div>
              </div>
              <SignOutButton />
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
