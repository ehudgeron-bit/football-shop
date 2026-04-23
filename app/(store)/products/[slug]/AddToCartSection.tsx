"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/format";
import type { ProductWithRelations } from "@/repositories/product.repository";

const SIZE_ORDER = ["S", "M", "L", "XL", "XXL", "3XL"];

interface AddToCartSectionProps {
  product: ProductWithRelations;
}

export function AddToCartSection({ product }: AddToCartSectionProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const sortedVariants = [...product.variants].sort(
    (a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size)
  );

  const selectedVariant = sortedVariants.find((v) => v.id === selectedVariantId);
  const currentPrice = selectedVariant
    ? Number(selectedVariant.priceOverride ?? product.basePrice)
    : null;

  async function handleAddToCart() {
    if (!selectedVariantId) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    setLoading(true);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: selectedVariantId, quantity: 1 }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast(data.error ?? "שגיאה בהוספה לסל", "error");
        return;
      }

      toast(`${product.name} — נוסף לסל הקניות`, "success");
      router.refresh();
    } catch {
      toast("שגיאת שרת", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Size selector */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">בחר מידה</p>
          {currentPrice && (
            <p className="text-sm font-medium text-text-secondary">
              {formatPrice(currentPrice)}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {sortedVariants.map((variant) => {
            const outOfStock = variant.stock === 0;
            const isSelected = variant.id === selectedVariantId;

            return (
              <button
                key={variant.id}
                disabled={outOfStock}
                onClick={() => {
                  setSelectedVariantId(variant.id);
                  setSizeError(false);
                }}
                className={[
                  "relative h-11 min-w-[3rem] rounded-8 border px-3 text-sm font-medium transition-colors",
                  isSelected
                    ? "border-brand-primary bg-brand-primary text-white"
                    : outOfStock
                    ? "cursor-not-allowed border-surface-tertiary text-text-muted line-through"
                    : "border-surface-tertiary text-text-primary hover:border-brand-primary",
                ].join(" ")}
                aria-pressed={isSelected}
                aria-label={`מידה ${variant.size}${outOfStock ? " (אזל)" : ""}`}
              >
                {variant.size}
                {/* Low stock warning */}
                {!outOfStock && variant.stock <= 3 && (
                  <span className="absolute -top-1 -end-1 flex h-2 w-2 rounded-full bg-brand-orange" />
                )}
              </button>
            );
          })}
        </div>

        {sizeError && (
          <p className="mt-2 text-xs text-red-600">נא לבחור מידה לפני הוספה לסל</p>
        )}
        {selectedVariant && selectedVariant.stock <= 3 && selectedVariant.stock > 0 && (
          <p className="mt-2 text-xs text-brand-orange">
            נשארו רק {selectedVariant.stock} יחידות במלאי
          </p>
        )}
      </div>

      {/* Add to cart */}
      <Button
        onClick={handleAddToCart}
        loading={loading}
        fullWidth
        size="lg"
        disabled={sortedVariants.every((v) => v.stock === 0)}
      >
        {sortedVariants.every((v) => v.stock === 0) ? "אזל מהמלאי" : "הוסף לסל"}
      </Button>
    </div>
  );
}
