"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function DeleteApplicationButton({
  applicationId,
}: {
  applicationId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setError(null);
          const confirmed = window.confirm(
            "Delete this application and all its notes?",
          );
          if (!confirmed) return;

          startTransition(async () => {
            const response = await fetch(`/api/applications/${applicationId}`, {
              method: "DELETE",
            });

            if (!response.ok) {
              setError("Could not delete application.");
              return;
            }

            router.push("/applications");
            router.refresh();
          });
        }}
        className="rounded-2xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Deleting..." : "Delete application"}
      </button>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
