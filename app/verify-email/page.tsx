import Link from "next/link";
import { consumeEmailVerificationToken } from "@/lib/email-verification";

type SearchParams = Promise<{
  token?: string;
}>;

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const result = await consumeEmailVerificationToken(params.token ?? "");

  const content =
    result.status === "verified"
      ? {
          eyebrow: "Email verified",
          title: "Your Applin account is ready",
          description: `The address ${result.email} has been verified. You can now sign in with your email and password.`,
          primaryHref: "/login",
          primaryLabel: "Go to sign in",
        }
      : result.status === "expired"
        ? {
            eyebrow: "Link expired",
            title: "This verification link has expired",
            description: `The link for ${result.email} is no longer valid. Request a fresh verification link from the sign-in page.`,
            primaryHref: "/login",
            primaryLabel: "Open sign in",
          }
        : result.status === "missing"
          ? {
              eyebrow: "Missing token",
              title: "Verification link is incomplete",
              description:
                "This verification request is missing its token. Use the latest email we sent you or request a new verification link.",
              primaryHref: "/register",
              primaryLabel: "Create account",
            }
          : {
              eyebrow: "Invalid link",
              title: "This verification link is not valid",
              description:
                "The link may have already been used or copied incorrectly. Request a fresh verification link from the sign-in page.",
              primaryHref: "/login",
              primaryLabel: "Open sign in",
            };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f4ec_0%,#f2ebdf_48%,#e7dfcf_100%)] px-4 py-10 text-stone-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
        <section className="w-full rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_30px_80px_rgba(86,83,75,0.12)] backdrop-blur sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">
            {content.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-stone-950">
            {content.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-stone-600">
            {content.description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={content.primaryHref}
              className="rounded-full border border-amber-200 bg-amber-200 px-6 py-3 text-sm font-medium text-stone-950 transition hover:bg-amber-100"
            >
              {content.primaryLabel}
            </Link>
            <Link
              href="/"
              className="rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-800 transition hover:bg-stone-50"
            >
              Back to home
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
