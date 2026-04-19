"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

type LoginFormProps = {
  oauthProviders: {
    google: boolean;
  };
};

type OAuthProviderId = "google";

function OAuthIcon({ provider }: { provider: OAuthProviderId }) {
  if (provider === "google") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M21.6 12.23c0-.68-.06-1.33-.17-1.96H12v3.7h5.39a4.62 4.62 0 0 1-2 3.04v2.52h3.24c1.9-1.75 2.97-4.34 2.97-7.3Z"
        />
        <path
          fill="#34A853"
          d="M12 22c2.7 0 4.96-.9 6.61-2.44l-3.24-2.52c-.9.6-2.05.96-3.37.96-2.6 0-4.8-1.76-5.58-4.12H3.07v2.6A10 10 0 0 0 12 22Z"
        />
        <path
          fill="#FBBC05"
          d="M6.42 13.88A5.98 5.98 0 0 1 6.1 12c0-.65.11-1.28.32-1.88V7.52H3.07A10 10 0 0 0 2 12c0 1.62.39 3.15 1.07 4.48l3.35-2.6Z"
        />
        <path
          fill="#EA4335"
          d="M12 5.98c1.47 0 2.8.5 3.84 1.49l2.88-2.88C16.95 2.94 14.69 2 12 2a10 10 0 0 0-8.93 5.52l3.35 2.6c.79-2.36 2.99-4.14 5.58-4.14Z"
        />
      </svg>
    );
  }
}

export function LoginForm({ oauthProviders }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [activeOAuthProvider, setActiveOAuthProvider] =
    useState<OAuthProviderId | null>(null);
  const enabledOAuthProviders = [
    oauthProviders.google
      ? { id: "google", label: "Continue with Google" }
      : null,
  ].filter((provider): provider is { id: OAuthProviderId; label: string } =>
    Boolean(provider),
  );

  async function handleOAuthSignIn(provider: OAuthProviderId) {
    setError(null);
    setNotice(null);
    setActiveOAuthProvider(provider);

    try {
      await signIn(provider, { callbackUrl: "/applications" });
    } catch {
      setError(`Could not continue with ${provider}. Please try again.`);
      setActiveOAuthProvider(null);
    }
  }

  async function handleResendVerification() {
    if (!unverifiedEmail) return;

    setError(null);
    setNotice(null);

    const response = await fetch("/api/auth/verify-email/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: unverifiedEmail }),
    });

    const data = (await response.json().catch(() => null)) as {
      message?: string;
      error?: string;
    } | null;

    if (!response.ok) {
      setError(data?.error ?? "Could not resend verification email.");
      return;
    }

    setNotice(data?.message ?? "A fresh verification link is now available.");
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        setNotice(null);
        setUnverifiedEmail(null);
        const formData = new FormData(event.currentTarget);
        const email = String(formData.get("email") ?? "")
          .trim()
          .toLowerCase();
        const password = String(formData.get("password") ?? "");

        startTransition(async () => {
          const validationResponse = await fetch("/api/auth/credentials", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          const validationData = (await validationResponse
            .json()
            .catch(() => null)) as {
            error?: string;
            code?: string;
            email?: string;
          } | null;

          if (!validationResponse.ok) {
            if (validationData?.code === "EMAIL_NOT_VERIFIED") {
              setUnverifiedEmail(validationData.email ?? email);
              setError(
                "Email not verified yet. Check your inbox or resend the verification link.",
              );
              return;
            }

            setError(validationData?.error ?? "Invalid email or password.");
            return;
          }

          const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
          });

          if (result?.error) {
            setError("Invalid email or password.");
            return;
          }

          router.push("/applications");
          router.refresh();
        });
      }}
    >
      {enabledOAuthProviders.length > 0 ? (
        <div className="space-y-4">
          <div className="grid gap-3">
            {enabledOAuthProviders.map((provider) => (
              <button
                key={provider.id}
                type="button"
                onClick={() => void handleOAuthSignIn(provider.id)}
                disabled={isPending || activeOAuthProvider !== null}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-800 shadow-[0_12px_28px_rgba(87,83,78,0.06)] transition hover:border-stone-300 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <OAuthIcon provider={provider.id} />
                <span>
                  {activeOAuthProvider === provider.id
                    ? "Redirecting..."
                    : provider.label}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-stone-400">
            <span className="h-px flex-1 bg-stone-200" />
            <span>Or continue with email</span>
            <span className="h-px flex-1 bg-stone-200" />
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-stone-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-stone-700"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          placeholder="At least 8 characters"
        />
      </div>

      {error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      {notice ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notice}
        </p>
      ) : null}

      {unverifiedEmail ? (
        <button
          type="button"
          onClick={() => void handleResendVerification()}
          className="w-full rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-800 transition hover:bg-stone-50"
        >
          Resend verification link
        </button>
      ) : null}

      <button
        type="submit"
        disabled={isPending || activeOAuthProvider !== null}
        className="w-full rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-sm text-stone-600">
        Need an account?{" "}
        <Link
          href="/register"
          className="font-medium text-stone-950 underline decoration-sky-300 underline-offset-4"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
