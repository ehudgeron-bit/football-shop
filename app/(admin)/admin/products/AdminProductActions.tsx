"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import type { ProductWithRelations } from "@/repositories/product.repository";

const SIZES = ["S", "M", "L", "XL", "XXL", "3XL"] as const;

interface Team { id: string; name: string }
interface Category { id: string; name: string }

interface Props {
  mode: "create" | "edit";
  product?: ProductWithRelations;
  teams: Team[];
  categories: Category[];
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

export function AdminProductActions({ mode, product, teams, categories }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: product?.name ?? "",
    nameEn: product?.nameEn ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    basePrice: product ? String(Number(product.basePrice)) : "",
    teamId: product?.team?.id ?? "",
    categoryId: product?.category?.id ?? "",
    isFeatured: product?.isFeatured ?? false,
  });

  const [variants, setVariants] = useState<
    { size: string; stock: number; priceOverride?: number }[]
  >(
    mode === "edit" && product
      ? product.variants.map((v) => ({
          size: v.size,
          stock: v.stock,
          priceOverride: v.priceOverride ? Number(v.priceOverride) : undefined,
        }))
      : SIZES.map((size) => ({ size, stock: 0 }))
  );

  function setVariantStock(size: string, stock: number) {
    setVariants((prev) =>
      prev.map((v) => (v.size === size ? { ...v, stock: Math.max(0, stock) } : v))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      basePrice: Number(form.basePrice),
      teamId: form.teamId || undefined,
      categoryId: form.categoryId || undefined,
      variants: variants.map((v) => ({
        size: v.size,
        stock: v.stock,
        priceOverride: v.priceOverride || undefined,
      })),
    };

    try {
      const url =
        mode === "create" ? "/api/admin/products" : `/api/admin/products/${product!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "שגיאה בשמירה", "error");
        return;
      }

      toast(mode === "create" ? "מוצר נוצר בהצלחה" : "מוצר עודכן בהצלחה", "success");
      setOpen(false);
      window.location.reload();
    } catch {
      toast("שגיאת שרת", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!product) return;
    if (!confirm(`למחוק את "${product.name}"?`)) return;

    const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    if (res.ok) {
      toast("מוצר הוסר", "success");
      window.location.reload();
    } else {
      toast("שגיאה במחיקה", "error");
    }
  }

  return (
    <>
      <div className="flex gap-2">
        {mode === "create" ? (
          <Button size="sm" onClick={() => setOpen(true)}>
            + מוצר חדש
          </Button>
        ) : (
          <>
            <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
              עריכה
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDelete} className="text-red-600 hover:text-red-700">
              מחיקה
            </Button>
          </>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-lg rounded-12 bg-white shadow-xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-surface-tertiary px-6 py-4">
              <h2 className="font-semibold">
                {mode === "create" ? "מוצר חדש" : `עריכת "${product?.name}"`}
              </h2>
              <button onClick={() => setOpen(false)} className="text-text-secondary hover:text-text-primary text-xl leading-none">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
              <Input
                label="שם מוצר (עברית)"
                value={form.name}
                onChange={(e) => {
                  setForm((p) => ({
                    ...p,
                    name: e.target.value,
                    slug: mode === "create" ? slugify(e.target.value) : p.slug,
                  }));
                }}
                required
              />

              <Input
                label="Slug (URL)"
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: slugify(e.target.value) }))}
                dir="ltr"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-text-secondary">קבוצה</label>
                  <select
                    value={form.teamId}
                    onChange={(e) => setForm((p) => ({ ...p, teamId: e.target.value }))}
                    className="w-full rounded-8 border border-surface-tertiary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="">ללא קבוצה</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-text-secondary">קטגוריה</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
                    className="w-full rounded-8 border border-surface-tertiary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="">ללא קטגוריה</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Input
                label="מחיר בסיס (₪)"
                type="number"
                min="0"
                step="0.01"
                value={form.basePrice}
                onChange={(e) => setForm((p) => ({ ...p, basePrice: e.target.value }))}
                dir="ltr"
                required
              />

              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">תיאור</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  required
                  className="w-full rounded-8 border border-surface-tertiary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
                />
              </div>

              {/* Variants / stock */}
              <div>
                <p className="mb-2 text-xs font-medium text-text-secondary">מלאי לפי מידה</p>
                <div className="grid grid-cols-3 gap-2">
                  {variants.map((v) => (
                    <div key={v.size} className="flex flex-col gap-1">
                      <label className="text-xs text-center font-medium text-text-secondary">{v.size}</label>
                      <input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) => setVariantStock(v.size, Number(e.target.value))}
                        className="rounded-6 border border-surface-tertiary px-2 py-1.5 text-center text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm((p) => ({ ...p, isFeatured: e.target.checked }))}
                />
                מוצר מומלץ (מוצג בעמוד הראשי)
              </label>

              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={loading} fullWidth>
                  {mode === "create" ? "צור מוצר" : "שמור שינויים"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} fullWidth>
                  ביטול
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
