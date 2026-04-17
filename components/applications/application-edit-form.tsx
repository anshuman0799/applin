"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ApplicationWithNotes } from "@/types";

export function ApplicationEditForm({
  application,
}: {
  application: ApplicationWithNotes;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        const formData = new FormData(event.currentTarget);
        const payload = {
          company: String(formData.get("company") ?? "").trim(),
          role: String(formData.get("role") ?? "").trim(),
          jobLink: String(formData.get("jobLink") ?? "").trim(),
          location: String(formData.get("location") ?? "").trim(),
        };

        startTransition(async () => {
          const response = await fetch(`/api/applications/${application.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const data = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;

          if (!response.ok) {
            setError(data?.error ?? "Could not update application.");
            return;
          }

          router.refresh();
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-stone-700">
          <span className="font-medium">Company</span>
          <input
            name="company"
            defaultValue={application.company}
            required
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          />
        </label>
        <label className="space-y-2 text-sm text-stone-700">
          <span className="font-medium">Role</span>
          <input
            name="role"
            defaultValue={application.role}
            required
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          />
        </label>
        <label className="space-y-2 text-sm text-stone-700">
          <span className="font-medium">Location</span>
          <input
            name="location"
            defaultValue={application.location ?? ""}
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          />
        </label>
      </div>

      <label className="space-y-2 text-sm text-stone-700">
        <span className="font-medium">Job link</span>
        <input
          name="jobLink"
          type="url"
          defaultValue={application.jobLink ?? ""}
          className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
        />
      </label>

      {error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Saving changes..." : "Save changes"}
      </button>
    </form>
  );
}
