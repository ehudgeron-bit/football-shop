import Link from "next/link";
import type { ProductWithRelations } from "@/repositories/product.repository";
import { formatPrice } from "@/lib/format";

interface ProductCardProps {
  product: ProductWithRelations;
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images[0];
  const hasStock = product.variants.some((v) => v.stock > 0);

  const minPrice = product.variants.reduce((min, v) => {
    const price = Number(v.priceOverride ?? product.basePrice);
    return price < min ? price : min;
  }, Number(product.basePrice));

  const compareAt = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const discountPct =
    compareAt && compareAt > minPrice
      ? Math.round((1 - minPrice / compareAt) * 100)
      : null;

  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const isLowStock = hasStock && totalStock > 0 && totalStock <= 5;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col"
      aria-label={product.name}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-surface-secondary" style={{ aspectRatio: "3/4", borderRadius: "var(--rounded-corners-radius)" }}>
        {primaryImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primaryImage.url}
            alt={primaryImage.altText ?? product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-text-muted">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="#ccc" strokeWidth="2" />
              <circle cx="24" cy="24" r="8" fill="#ddd" />
              <path d="M24 4 L24 16 M24 32 L24 44 M4 24 L16 24 M32 24 L44 24" stroke="#ccc" strokeWidth="2" />
            </svg>
          </div>
        )}

        {/* Out of stock overlay */}
        {!hasStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-pill bg-white px-3 py-1 text-xs font-bold text-text-primary">
              אזל מהמלאי
            </span>
          </div>
        )}

        {/* Badges row — top right */}
        <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
          {discountPct && hasStock && (
            <span className="rounded-4 bg-[#cf2e2e] px-2 py-0.5 text-[11px] font-bold text-white shadow">
              -{discountPct}%
            </span>
          )}
          {!discountPct && product.isFeatured && hasStock && (
            <span className="rounded-4 bg-[#E69900] px-2 py-0.5 text-[11px] font-bold text-white shadow">
              מומלץ
            </span>
          )}
        </div>

        {/* Low stock urgency — bottom left */}
        {isLowStock && (
          <div className="absolute bottom-2 left-2">
            <span className="rounded-4 bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-orange-300">
              נשארו {totalStock} בלבד
            </span>
          </div>
        )}

        {/* Hover CTA */}
        {hasStock && (
          <div className="absolute bottom-0 left-0 right-0 translate-y-full py-2.5 text-center text-xs font-semibold text-white transition-transform duration-200 group-hover:translate-y-0"
            style={{ background: "var(--color-add-to-cart-background)" }}>
            בחר מידה ➜
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 flex flex-col gap-0.5">
        {product.team && (
          <p className="text-xs font-medium text-text-muted">{product.team.name}</p>
        )}
        <p className="text-sm font-semibold leading-snug text-text-primary line-clamp-2">
          {product.name}
        </p>

        {/* Price row */}
        <div className="mt-1 flex items-center gap-2">
          <p className="text-base font-bold text-text-primary">{formatPrice(minPrice)}</p>
          {compareAt && compareAt > minPrice && (
            <p className="text-sm text-text-muted line-through">{formatPrice(compareAt)}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-3">
      <div className="rounded-12 bg-surface-secondary" style={{ aspectRatio: "3/4" }} />
      <div className="h-2.5 w-1/3 rounded bg-surface-secondary" />
      <div className="h-4 w-4/5 rounded bg-surface-secondary" />
      <div className="h-4 w-1/4 rounded bg-surface-secondary" />
    </div>
  );
}
