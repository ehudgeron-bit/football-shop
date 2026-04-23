"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import type { Category, Team } from "@prisma/client";

interface FilterSidebarProps {
  categories: Category[];
  teams: Team[];
  currentFilters: Record<string, string | undefined>;
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-surface-tertiary pb-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-2 text-sm font-semibold text-text-primary"
      >
        {title}
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="currentColor"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

export function FilterSidebar({ categories, teams, currentFilters }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const hasActiveFilter = currentFilters.category || currentFilters.team || currentFilters.q || currentFilters.featured;

  return (
    <div className="flex flex-col gap-0 text-sm">
      {/* Search */}
      <div className="mb-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value;
            updateFilter("q", q || null);
          }}
        >
          <div className="relative">
            <input
              name="q"
              defaultValue={currentFilters.q ?? ""}
              placeholder="חיפוש..."
              className="input-base pr-9 text-sm"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {hasActiveFilter && (
        <button
          onClick={() => router.push(pathname)}
          className="mb-4 flex items-center gap-1.5 text-xs font-medium text-[#FF5000] hover:underline"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
          נקה סינון
        </button>
      )}

      {/* Categories */}
      <FilterSection title="קטגוריה">
        <ul className="flex flex-col gap-2">
          <li>
            <button
              onClick={() => updateFilter("category", null)}
              className={`w-full text-right transition hover:text-text-primary ${
                !currentFilters.category ? "font-semibold text-text-primary" : "text-text-secondary"
              }`}
            >
              כל הקטגוריות
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => updateFilter("category", cat.slug)}
                className={`flex w-full items-center justify-between text-right transition hover:text-text-primary ${
                  currentFilters.category === cat.slug
                    ? "font-semibold text-text-primary"
                    : "text-text-secondary"
                }`}
              >
                {cat.name}
                {currentFilters.category === cat.slug && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF5000]" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* Teams */}
      <FilterSection title="קבוצה">
        <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto">
          <li>
            <button
              onClick={() => updateFilter("team", null)}
              className={`w-full text-right transition hover:text-text-primary ${
                !currentFilters.team ? "font-semibold text-text-primary" : "text-text-secondary"
              }`}
            >
              כל הקבוצות
            </button>
          </li>
          {teams.map((team) => (
            <li key={team.id}>
              <button
                onClick={() => updateFilter("team", team.slug)}
                className={`flex w-full items-center justify-between text-right transition hover:text-text-primary ${
                  currentFilters.team === team.slug
                    ? "font-semibold text-text-primary"
                    : "text-text-secondary"
                }`}
              >
                {team.name}
                {currentFilters.team === team.slug && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF5000]" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* Featured */}
      <FilterSection title="סינון">
        <button
          onClick={() => updateFilter("featured", currentFilters.featured ? null : "true")}
          className={`flex w-full items-center gap-2 text-right transition ${
            currentFilters.featured ? "font-semibold text-text-primary" : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <span
            className={`flex h-4 w-4 items-center justify-center rounded border transition ${
              currentFilters.featured ? "border-[#FF5000] bg-[#FF5000]" : "border-surface-tertiary"
            }`}
          >
            {currentFilters.featured && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          מוצרים מומלצים
        </button>
      </FilterSection>
    </div>
  );
}
