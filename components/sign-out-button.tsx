"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              await signOut({ callbackUrl: "/" });
            } catch {
              setError("Could not sign out right now.");
            }
          });
        }}
        className="rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-black/20 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
      >
        {isPending ? "Signing out..." : "Sign out"}
      </button>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
