import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { AdminInventoryEdit } from "./AdminInventoryEdit";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "ניהול מלאי" };
export const revalidate = 0;

export default async function AdminInventoryPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      basePrice: true,
      team: { select: { name: true } },
      variants: {
        select: { id: true, size: true, stock: true, priceOverride: true },
        orderBy: { size: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const lowStockCount = products
    .flatMap((p) => p.variants)
    .filter((v) => v.stock <= 3).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">מלאי</h1>
        {lowStockCount > 0 && (
          <span className="rounded-pill bg-red-50 px-3 py-1 text-sm font-medium text-red-600">
            {lowStockCount} מידות במלאי נמוך
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {products.map((product) => {
          const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
          return (
            <div
              key={product.id}
              className="rounded-12 border border-surface-tertiary bg-white"
            >
              <div className="flex items-center justify-between border-b border-surface-tertiary px-6 py-4">
                <div>
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-xs text-text-secondary">
                    {product.team?.name ?? "ללא קבוצה"} ·{" "}
                    {formatPrice(Number(product.basePrice))} · סה&quot;כ מלאי:{" "}
                    <span
                      className={
                        totalStock === 0
                          ? "font-bold text-red-600"
                          : totalStock <= 5
                          ? "font-bold text-yellow-600"
                          : "font-bold text-green-600"
                      }
                    >
                      {totalStock}
                    </span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-px bg-surface-tertiary sm:grid-cols-6">
                {product.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className={`flex flex-col items-center gap-2 bg-white p-4 ${
                      variant.stock === 0
                        ? "bg-red-50"
                        : variant.stock <= 3
                        ? "bg-yellow-50"
                        : ""
                    }`}
                  >
                    <span className="text-xs font-semibold text-text-secondary">
                      {variant.size}
                    </span>
                    <span
                      className={`text-xl font-bold ${
                        variant.stock === 0
                          ? "text-red-600"
                          : variant.stock <= 3
                          ? "text-yellow-600"
                          : "text-text-primary"
                      }`}
                    >
                      {variant.stock}
                    </span>
                    <AdminInventoryEdit variantId={variant.id} currentStock={variant.stock} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
