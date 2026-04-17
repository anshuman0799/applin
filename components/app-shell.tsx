import Link from "next/link";
import { initialsFromName } from "@/lib/utils";
import { SignOutButton } from "@/components/sign-out-button";

type AppShellProps = {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
  title: string;
  eyebrow: string;
  description: string;
  children: React.ReactNode;
};

export function AppShell({
  user,
  title,
  eyebrow,
  description,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_32%),linear-gradient(180deg,_#f7f4ec_0%,_#f3efe5_42%,_#ebe5d7_100%)] text-stone-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-6 rounded-[2rem] border border-white/50 bg-white/70 px-5 py-5 shadow-[0_30px_80px_rgba(87,83,78,0.12)] backdrop-blur sm:px-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <Link
                  href="/applications"
                  className="inline-flex items-center gap-3"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-stone-900 text-sm font-semibold text-stone-50 shadow-lg shadow-stone-900/15">
                    AP
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
                      Applin
                    </p>
                    <p className="text-sm text-stone-600">
                      A job tracker with room for real pipelines.
                    </p>
                  </div>
                </Link>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
                  {eyebrow}
                </p>
                <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
                  {title}
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
                  {description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-stone-200/80 bg-stone-50/90 px-4 py-3 md:min-w-[280px] md:justify-end">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-100 text-sm font-semibold text-sky-900">
                  {initialsFromName(
                    user.name,
                    user.email?.[0]?.toUpperCase() ?? "A",
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-900">
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
