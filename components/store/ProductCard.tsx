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
      className="group flex flex-col rounded-12 border border-gray-200 bg-white transition hover:shadow-md dark:border-white/8 dark:bg-[#1a1a1a]"
      aria-label={product.name}
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-t-12 bg-gray-50 dark:bg-[#222]" style={{ aspectRatio: "3/4" }}>
        {primaryImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primaryImage.url}
            alt={primaryImage.altText ?? product.name}
            className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="#ccc" strokeWidth="2" />
              <circle cx="24" cy="24" r="8" fill="#ddd" />
            </svg>
          </div>
        )}

        {/* Out of stock */}
        {!hasStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-pill bg-white px-3 py-1 text-xs font-bold text-gray-900">אזל מהמלאי</span>
          </div>
        )}

        {/* Top badges */}
        <div className="absolute right-2 top-2 flex flex-col gap-1">
          {discountPct && hasStock && (
            <span className="rounded-4 bg-[#E53935] px-2 py-0.5 text-[11px] font-bold text-white">
              -{discountPct}%
            </span>
          )}
          {!discountPct && product.isFeatured && hasStock && (
            <span className="rounded-4 bg-[#E69900] px-2 py-0.5 text-[11px] font-bold text-white">
              מומלץ
            </span>
          )}
        </div>

        {/* Low stock */}
        {isLowStock && (
          <div className="absolute bottom-10 left-2">
            <span className="rounded-4 bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-orange-300">
              נשארו {totalStock} בלבד
            </span>
          </div>
        )}

        {/* Hover CTA */}
        {hasStock && (
          <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-gray-900 py-2.5 text-center text-xs font-bold text-white transition-transform duration-200 group-hover:translate-y-0 dark:bg-[#333]">
            הוסף לסל
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 p-3">
        {product.team && (
          <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500">{product.team.name}</p>
        )}
        <p className="text-sm font-semibold leading-snug text-gray-900 dark:text-white line-clamp-2">
          {product.name}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-sm font-black text-[#E53935]">{formatPrice(minPrice)}</p>
          {compareAt && compareAt > minPrice && (
            <p className="text-xs text-gray-400 line-through dark:text-gray-500">{formatPrice(compareAt)}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col rounded-12 border border-gray-200 dark:border-white/8">
      <div className="rounded-t-12 bg-gray-100 dark:bg-[#1a1a1a]" style={{ aspectRatio: "3/4" }} />
      <div className="flex flex-col gap-2 p-3">
        <div className="h-2.5 w-1/3 rounded bg-gray-100 dark:bg-[#222]" />
        <div className="h-4 w-4/5 rounded bg-gray-100 dark:bg-[#222]" />
        <div className="h-4 w-1/4 rounded bg-gray-100 dark:bg-[#222]" />
      </div>
    </div>
  );
}
