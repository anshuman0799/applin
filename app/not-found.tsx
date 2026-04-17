import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#f6f1e7_0%,_#ede5d8_100%)] px-4 text-stone-900">
      <div className="max-w-xl rounded-[2rem] border border-white/70 bg-white/90 p-10 text-center shadow-[0_30px_80px_rgba(87,83,78,0.12)]">
        <p className="text-xs uppercase tracking-[0.3em] text-stone-400">
          Not found
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-stone-950">
          That page does not exist
        </h1>
        <p className="mt-4 text-sm leading-7 text-stone-600">
          The resource may have been removed, or you may not have access to it
          from this account.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/applications"
            className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
          >
            Go to dashboard
          </Link>
          <Link
            href="/"
            className="rounded-full border border-stone-200 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
