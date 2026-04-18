"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  compact?: boolean;
};

export function ApplicationCreateForm({ compact = false }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        const form = event.currentTarget;
        const formData = new FormData(form);
        const payload = {
          company: String(formData.get("company") ?? "").trim(),
          role: String(formData.get("role") ?? "").trim(),
          jobLink: String(formData.get("jobLink") ?? "").trim(),
          location: String(formData.get("location") ?? "").trim(),
        };

        startTransition(async () => {
          const response = await fetch("/api/applications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const data = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;

          if (!response.ok) {
            setError(data?.error ?? "Could not create application.");
            return;
          }

          form.reset();
          router.refresh();
        });
      }}
    >
      <div className="grid gap-4">
        <label className="space-y-2 text-sm text-stone-700">
          <span className="font-medium">Company</span>
          <input
            name="company"
            required
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            placeholder="OpenAI"
          />
        </label>
        <label className="space-y-2 text-sm text-stone-700">
          <span className="font-medium">Role</span>
          <input
            name="role"
            required
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            placeholder="Software Engineer"
          />
        </label>
        <label className="space-y-2 text-sm text-stone-700">
          <span className="font-medium">Location</span>
          <input
            name="location"
            required
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            placeholder="Remote"
          />
        </label>
        <label className="space-y-2 text-sm text-stone-700">
          <span className="font-medium">Job link</span>
          <input
            name="jobLink"
            type="url"
            required
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            placeholder="https://company.com/jobs/role"
          />
        </label>
      </div>

      {error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending
          ? "Saving..."
          : compact
            ? "Add application"
            : "Create application"}
      </button>

      <p className="text-xs leading-6 text-stone-500">
        New applications start in{" "}
        <span className="font-medium text-stone-700">Applied</span> by default.
      </p>
    </form>
  );
}
