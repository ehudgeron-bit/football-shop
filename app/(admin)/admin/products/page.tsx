export const dynamic = "force-dynamic";
import { productRepository } from "@/repositories/product.repository";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { AdminProductActions } from "./AdminProductActions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "ניהול מוצרים" };

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));

  const [{ items: products, total }, teams, categories] = await Promise.all([
    productRepository.findMany({ page, limit: 20 }),
    prisma.team.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">מוצרים ({total})</h1>
        <AdminProductActions mode="create" teams={teams} categories={categories} />
      </div>

      <div className="rounded-12 border border-surface-tertiary bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-tertiary text-right text-xs font-medium text-text-secondary">
                <th className="px-4 py-3">תמונה</th>
                <th className="px-4 py-3">שם מוצר</th>
                <th className="px-4 py-3">קבוצה</th>
                <th className="px-4 py-3">קטגוריה</th>
                <th className="px-4 py-3">מחיר בסיס</th>
                <th className="px-4 py-3">מלאי</th>
                <th className="px-4 py-3">סטטוס</th>
                <th className="px-4 py-3">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-tertiary">
              {products.map((product) => {
                const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
                const image = product.images[0];
                return (
                  <tr key={product.id} className="hover:bg-surface-secondary">
                    <td className="px-4 py-3">
                      {image ? (
                        <img
                          src={image.url}
                          alt={image.altText ?? product.name}
                          className="h-12 w-12 rounded-6 object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-6 bg-surface-secondary flex items-center justify-center text-lg">
                          ⚽
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-text-muted font-mono">{product.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {product.team?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {product.category?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {formatPrice(Number(product.basePrice))}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-medium ${
                          totalStock === 0
                            ? "text-red-600"
                            : totalStock <= 5
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {totalStock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-pill px-2.5 py-1 text-xs font-medium ${
                          product.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-50 text-gray-500"
                        }`}
                      >
                        {product.isActive ? "פעיל" : "לא פעיל"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <AdminProductActions
                        mode="edit"
                        product={product}
                        teams={teams}
                        categories={categories}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-3 text-sm">
          {page > 1 && (
            <a
              href={`?page=${page - 1}`}
              className="rounded-8 border px-4 py-2 hover:bg-surface-secondary"
            >
              הקודם
            </a>
          )}
          <span className="px-4 py-2 text-text-secondary">
            עמוד {page} / {totalPages}
          </span>
          {page < totalPages && (
            <a
              href={`?page=${page + 1}`}
              className="rounded-8 border px-4 py-2 hover:bg-surface-secondary"
            >
              הבא
            </a>
          )}
        </div>
      )}
    </div>
  );
}
