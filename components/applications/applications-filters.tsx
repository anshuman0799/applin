"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import type { DashboardCategory } from "@/lib/utils";
import {
  DEFAULT_APPLICATION_STAGES,
  getAllowedStagesForCategory,
  normalizeStageForCategory,
} from "@/lib/utils";

type Props = {
  category: DashboardCategory;
  status: string;
  search: string;
  from: string;
  to: string;
};

export function ApplicationsFilters({
  category,
  status,
  search,
  from,
  to,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [draftSearch, setDraftSearch] = useState(search);
  const [draftCategory, setDraftCategory] =
    useState<DashboardCategory>(category);
  const [draftStatus, setDraftStatus] = useState(status);
  const [draftFrom, setDraftFrom] = useState(from);
  const [draftTo, setDraftTo] = useState(to);

  useEffect(() => {
    setDraftSearch(search);
    setDraftCategory(category);
    setDraftStatus(status);
    setDraftFrom(from);
    setDraftTo(to);
  }, [category, status, search, from, to]);

  function pushFilters(next: {
    category?: DashboardCategory;
    status?: string;
    search?: string;
    from?: string;
    to?: string;
  }) {
    const nextCategory = next.category ?? draftCategory;
    const nextStatus = normalizeStageForCategory(
      nextCategory,
      next.status ?? draftStatus,
    );
    const nextSearch = next.search ?? draftSearch;
    const nextFrom = next.from ?? draftFrom;
    const nextTo = next.to ?? draftTo;
    const params = new URLSearchParams();

    if (nextCategory !== "all") {
      params.set("category", nextCategory);
    }

    if (nextStatus !== "all") {
      params.set("status", nextStatus);
    }

    if (nextSearch.trim()) {
      params.set("q", nextSearch.trim());
    }

    if (nextFrom) {
      params.set("from", nextFrom);
    }

    if (nextTo) {
      params.set("to", nextTo);
    }

    startTransition(() => {
      router.replace(
        params.size > 0 ? `${pathname}?${params.toString()}` : pathname,
      );
    });
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (draftSearch !== search) {
        pushFilters({ search: draftSearch });
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [draftSearch, search]);

  const allowedStages = getAllowedStagesForCategory(draftCategory);
  const allowedStageSet = new Set<string>(allowedStages as string[]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_repeat(4,minmax(0,1fr))]">
      <label className="space-y-2 text-sm text-stone-700">
        <span className="font-medium">Search</span>
        <input
          name="q"
          value={draftSearch}
          onChange={(event) => setDraftSearch(event.target.value)}
          placeholder="Company, role, or location"
          className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
        />
      </label>

      <label className="space-y-2 text-sm text-stone-700">
        <span className="font-medium">Category</span>
        <select
          name="category"
          value={draftCategory}
          onChange={(event) => {
            const nextCategory = event.target.value as DashboardCategory;
            const nextStatus = normalizeStageForCategory(
              nextCategory,
              draftStatus,
            );

            setDraftCategory(nextCategory);
            setDraftStatus(nextStatus);
            pushFilters({ category: nextCategory, status: nextStatus });
          }}
          className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </label>

      <label className="space-y-2 text-sm text-stone-700">
        <span className="font-medium">Stage</span>
        <select
          name="status"
          value={draftStatus}
          onChange={(event) => {
            const nextStatus = event.target.value;
            setDraftStatus(nextStatus);
            pushFilters({ status: nextStatus });
          }}
          className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
        >
          <option value="all">All allowed stages</option>
          {DEFAULT_APPLICATION_STAGES.filter((stage) =>
            allowedStageSet.has(stage.id),
          ).map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.label}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm text-stone-700">
        <span className="font-medium">Applied from</span>
        <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 transition focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100">
          <span className="text-base text-stone-400">&#x1F4C5;</span>
          <input
            type="date"
            name="from"
            value={draftFrom}
            onChange={(event) => {
              const nextFrom = event.target.value;
              setDraftFrom(nextFrom);
              pushFilters({ from: nextFrom });
            }}
            className="scheme-light w-full bg-transparent text-sm text-stone-900 outline-none"
          />
        </div>
      </label>

      <label className="space-y-2 text-sm text-stone-700">
        <span className="font-medium">Applied to</span>
        <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 transition focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100">
          <span className="text-base text-stone-400">&#x1F4C5;</span>
          <input
            type="date"
            name="to"
            value={draftTo}
            onChange={(event) => {
              const nextTo = event.target.value;
              setDraftTo(nextTo);
              pushFilters({ to: nextTo });
            }}
            className="scheme-light w-full bg-transparent text-sm text-stone-900 outline-none"
          />
        </div>
      </label>

      <div className="flex items-end gap-3 lg:col-span-5">
        <p className="text-sm text-stone-500">
          Filters apply automatically as you change them.
        </p>
        <Link
          href="/applications/list"
          className="ml-auto rounded-full border border-stone-200 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
        >
          Reset
        </Link>
        <Link
          href="/applications"
          className="rounded-full border border-stone-200 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
        >
          Back to dashboard
        </Link>
      </div>

      {isPending ? (
        <p className="lg:col-span-5 text-sm text-stone-500">
          Updating results...
        </p>
      ) : null}
    </div>
  );
}
