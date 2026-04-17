"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Note } from "@/types";
import { formatDate } from "@/lib/utils";

type Props = {
  applicationId: string;
  notes: Note[];
};

export function NotesPanel({ applicationId, notes }: Props) {
  const router = useRouter();
  const [createError, setCreateError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <form
        className="space-y-3 rounded-[1.75rem] border border-stone-200 bg-stone-50/80 p-5"
        onSubmit={(event) => {
          event.preventDefault();
          setCreateError(null);
          const form = event.currentTarget;
          const formData = new FormData(form);
          const payload = {
            content: String(formData.get("content") ?? "").trim(),
          };

          startTransition(async () => {
            const response = await fetch(
              `/api/applications/${applicationId}/notes`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              },
            );
            const data = (await response.json().catch(() => null)) as {
              error?: string;
            } | null;

            if (!response.ok) {
              setCreateError(data?.error ?? "Could not add note.");
              return;
            }

            form.reset();
            router.refresh();
          });
        }}
      >
        <div>
          <p className="text-sm font-medium text-stone-900">Add note</p>
          <p className="mt-1 text-sm text-stone-600">
            Capture prep thoughts, recruiter signals, or your next follow-up.
          </p>
        </div>
        <textarea
          name="content"
          required
          rows={4}
          className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          placeholder="Example: recruiter asked for system design examples and confirmed onsite next week."
        />
        {createError ? (
          <p className="text-sm text-rose-600">{createError}</p>
        ) : null}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving note..." : "Add note"}
        </button>
      </form>

      <div className="space-y-4">
        {notes.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-stone-300 bg-white/70 p-6 text-sm text-stone-500">
            No notes yet. Add recruiter feedback, prep ideas, or next steps
            here.
          </div>
        ) : null}

        {notes.map((note) => {
          const isEditing = editingId === note.id;

          return (
            <article
              key={note.id}
              className="rounded-[1.75rem] border border-white/70 bg-white/90 p-5 shadow-[0_24px_60px_rgba(87,83,78,0.08)]"
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-stone-400">
                    Entry
                  </p>
                  <p className="mt-1 text-sm text-stone-500">
                    Updated {formatDate(note.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-stone-200 px-3 py-1.5 text-sm text-stone-700 transition hover:bg-stone-50"
                    onClick={() => {
                      setEditError(null);
                      setEditingId(isEditing ? null : note.id);
                    }}
                  >
                    {isEditing ? "Cancel" : "Edit"}
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm text-rose-700 transition hover:bg-rose-100"
                    onClick={() => {
                      setEditError(null);
                      const confirmed = window.confirm("Delete this note?");
                      if (!confirmed) return;

                      startTransition(async () => {
                        const response = await fetch(
                          `/api/applications/${applicationId}/notes/${note.id}`,
                          {
                            method: "DELETE",
                          },
                        );

                        if (!response.ok) {
                          setEditError("Could not delete note.");
                          return;
                        }

                        router.refresh();
                      });
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {isEditing ? (
                <form
                  className="space-y-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setEditError(null);
                    const formData = new FormData(event.currentTarget);
                    const payload = {
                      content: String(formData.get("content") ?? "").trim(),
                    };

                    startTransition(async () => {
                      const response = await fetch(
                        `/api/applications/${applicationId}/notes/${note.id}`,
                        {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(payload),
                        },
                      );
                      const data = (await response
                        .json()
                        .catch(() => null)) as { error?: string } | null;

                      if (!response.ok) {
                        setEditError(data?.error ?? "Could not update note.");
                        return;
                      }

                      setEditingId(null);
                      router.refresh();
                    });
                  }}
                >
                  <textarea
                    name="content"
                    defaultValue={note.content}
                    rows={4}
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                  {editError ? (
                    <p className="text-sm text-rose-600">{editError}</p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending ? "Saving..." : "Save note"}
                  </button>
                </form>
              ) : (
                <p className="text-sm leading-7 text-stone-700">
                  {note.content}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
