import type { Metadata } from "next";
import { productService } from "@/services/product.service";
import { prisma } from "@/lib/prisma";
import { ProductCard, ProductCardSkeleton } from "@/components/store/ProductCard";
import { FilterSidebar } from "@/components/store/FilterSidebar";
import { Suspense } from "react";
import Link from "next/link";

export const metadata: Metadata = { title: "חולצות כדורגל" };
export const dynamic = "force-dynamic";

interface SearchParams extends Record<string, string | undefined> {
  category?: string;
  team?: string;
  featured?: string;
  q?: string;
  page?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

async function ProductGrid({ sp }: { sp: SearchParams }) {
  const page = Math.max(1, Number(sp.page ?? 1));

  let items: Awaited<ReturnType<typeof productService.list>>["items"] = [];
  let total = 0;
  try {
    ({ items, total } = await productService.list({
    categorySlug: sp.category,
    teamSlug: sp.team,
    featured: sp.featured === "true" ? true : undefined,
    search: sp.q,
    page,
    limit: 12,
    }));
  } catch {
    // DB not yet configured
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="text-5xl">🔍</span>
        <p className="mt-4 text-lg font-semibold">לא נמצאו מוצרים</p>
        <p className="mt-1 text-sm text-text-secondary">נסה לשנות את הסינון או חזור לכל המוצרים</p>
        <Link
          href="/products"
          className="mt-6 rounded-pill bg-[#FF5000] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#e04800]"
        >
          כל המוצרים
        </Link>
      </div>
    );
  }

  const totalPages = Math.ceil(total / 12);

  function buildUrl(targetPage: number) {
    const params = new URLSearchParams();
    if (sp.category) params.set("category", sp.category);
    if (sp.team) params.set("team", sp.team);
    if (sp.featured) params.set("featured", sp.featured);
    if (sp.q) params.set("q", sp.q);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return `/products${qs ? `?${qs}` : ""}`;
  }

  return (
    <div>
      <p className="mb-5 text-xs font-medium text-text-muted">{total} מוצרים</p>
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-3">
          {page > 1 && (
            <Link
              href={buildUrl(page - 1)}
              className="rounded-pill border border-surface-tertiary px-5 py-2.5 text-sm font-medium transition hover:bg-surface-secondary"
            >
              הקודם
            </Link>
          )}
          <span className="px-2 text-sm text-text-secondary">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={buildUrl(page + 1)}
              className="rounded-pill border border-surface-tertiary px-5 py-2.5 text-sm font-medium transition hover:bg-surface-secondary"
            >
              הבא
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  let categories: { id: string; name: string; slug: string }[] = [];
  let teams: { id: string; name: string; slug: string }[] = [];
  try {
    [categories, teams] = await Promise.all([
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.team.findMany({ orderBy: { name: "asc" } }),
    ]);
  } catch {
    // DB not yet configured
  }

  const activeLabel = sp.q
    ? `תוצאות עבור "${sp.q}"`
    : sp.category
    ? categories.find((c) => c.slug === sp.category)?.name ?? "חולצות כדורגל"
    : sp.team
    ? teams.find((t) => t.slug === sp.team)?.name ?? "חולצות כדורגל"
    : "חולצות כדורגל";

  return (
    <div className="mx-auto max-w-screen-lg px-4 py-8 sm:px-6" dir="rtl">
      <h1 className="mb-8 text-2xl font-extrabold">{activeLabel}</h1>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden w-48 flex-shrink-0 md:block">
          <FilterSidebar categories={categories} teams={teams} currentFilters={sp} />
        </aside>

        {/* Grid */}
        <div className="min-w-0 flex-1">
          <Suspense
            fallback={
              <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            }
          >
            <ProductGrid sp={sp} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
